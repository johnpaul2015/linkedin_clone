from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data) # creates a 'User' obj for saving in the db.
        user.set_password(password) # hashes the original password.
        user.save() # saves the data to the db.

        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("username", None)
        self.fields["email"] = serializers.EmailField() 
        
    def validate(self, attrs):
        email = attrs.get("email")

        user = User.objects.filter(email=email).first()

        if not user:
            raise serializers.ValidationError("Invalid email!")

        attrs["username"] = user.username

        return super().validate(attrs)