from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Connection
from profiles.models import Profile

User = get_user_model()


class UserProfileSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "headline",
            "bio",
            "location",
            "website",
            "phone",
            "linkedin_url",
            "profile_pic",
        ]


class UserSummarySerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
        ]

    def get_profile(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return UserProfileSummarySerializer(obj.profile).data
        return None


class ConnectionSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    receiver = UserSummarySerializer(read_only=True)

    class Meta:
        model = Connection
        fields = [
            "id",
            "sender",
            "receiver",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "sender", "receiver", "status", "created_at", "updated_at"]


class ConnectionCreateSerializer(serializers.Serializer):
    receiver_id = serializers.IntegerField(required=False)
    receiver = serializers.IntegerField(required=False)
    user_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        target_id = attrs.get("receiver_id") or attrs.get("receiver") or attrs.get("user_id")
        if not target_id:
            raise serializers.ValidationError({"receiver_id": "receiver_id is required."})

        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        sender = request.user

        # 1. Prevent connecting with self
        if sender.id == target_id:
            raise serializers.ValidationError({"receiver_id": "You cannot send a connection request to yourself."})

        # 2. Check if receiver exists
        try:
            receiver = User.objects.get(id=target_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"receiver_id": "Target user does not exist."})

        # 3. Check for existing connections in either direction
        existing = Connection.objects.filter(
            (Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender))
        )

        if existing.filter(status="accepted").exists():
            raise serializers.ValidationError("You are already connected with this user.")

        if existing.filter(status="pending").exists():
            raise serializers.ValidationError("A pending connection request already exists with this user.")

        attrs["receiver_user"] = receiver
        attrs["existing_rejected"] = existing.filter(status="rejected").first()
        return attrs

    def create(self, validated_data):
        sender = self.context["request"].user
        receiver = validated_data["receiver_user"]
        existing_rejected = validated_data.get("existing_rejected")

        # If a previously rejected connection exists, re-open it as a fresh pending request
        if existing_rejected:
            existing_rejected.sender = sender
            existing_rejected.receiver = receiver
            existing_rejected.status = "pending"
            existing_rejected.save()
            return existing_rejected

        return Connection.objects.create(
            sender=sender,
            receiver=receiver,
            status="pending"
        )


class ConnectedUserSerializer(serializers.ModelSerializer):
    connected_user = serializers.SerializerMethodField()

    class Meta:
        model = Connection
        fields = [
            "id",
            "connected_user",
            "status",
            "created_at",
        ]

    def get_connected_user(self, obj):
        request = self.context.get("request")
        current_user = request.user if request else None

        # Return the other person in the connection
        if obj.sender == current_user:
            other_user = obj.receiver
        else:
            other_user = obj.sender

        return UserSummarySerializer(other_user).data

