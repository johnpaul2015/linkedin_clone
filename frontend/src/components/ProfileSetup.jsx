import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = 'http://127.0.0.1:8000'

function ProfileSetup() {
  const navigate = useNavigate()

  // Section 1: Professional Information
  const [profile, setProfile] = useState({
    headline: '',
    linkedin_url: '',
    bio: '',
    location: '',
    website: '',
    phone: '',
  })

  // Section 2: Skills
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [skillError, setSkillError] = useState('')

  // Section 3: Education
  const [educationList, setEducationList] = useState([])

  // Section 4: Work Experience (Optional)
  const [includeExperience, setIncludeExperience] = useState(false)
  const [experience, setExperience] = useState({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    location: '',
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  // Skills Handlers
  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return

    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setSkillError(`"${trimmed}" has already been added.`)
      return
    }

    setSkills((prev) => [...prev, trimmed])
    setSkillInput('')
    setSkillError('')
  }

  const handleAddSampleSkill = (sample) => {
    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === sample.toLowerCase()
    )
    if (!isDuplicate) {
      setSkills((prev) => [...prev, sample])
      setSkillError('')
    }
  }

  const handleRemoveSkill = (indexToRemove) => {
    setSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  // Education Handlers
  const handleAddEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        degree: '',
        institution: '',
        field_of_study: '',
        start_year: '',
        end_year: '',
        currently_studying: false,
      },
    ])
  }

  const handleRemoveEducation = (idToRemove) => {
    setEducationList((prev) => prev.filter((item) => item.id !== idToRemove))
  }

  const handleEducationChange = (id, field, value) => {
    setEducationList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'currently_studying' && value === true) {
            updated.end_year = ''
          }
          return updated
        }
        return item
      })
    )
  }

  const handleExperienceChange = (e) => {
    setExperience({ ...experience, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access')
    if (!token) {
      setError('You are not logged in. Please log in first.')
      return
    }

    // 1. Client-side validations: Required profile fields
    if (!profile.headline.trim()) {
      setError('Professional headline is required.')
      return
    }

    if (!profile.linkedin_url.trim()) {
      setError('LinkedIn profile URL is required.')
      return
    }

    // 2. Phone validation: If provided, ensure it contains only digits
    if (profile.phone.trim()) {
      const phoneDigitsOnly = /^\d+$/
      if (!phoneDigitsOnly.test(profile.phone.trim())) {
        setError('Phone number must contain only digits.')
        return
      }
    }

    // 3. Education validation: If entries exist, check years
    for (const edu of educationList) {
      if (edu.institution.trim() || edu.degree.trim()) {
        if (!edu.institution.trim()) {
          setError('Please provide the institution name for all education entries.')
          return
        }
        if (!edu.degree.trim()) {
          setError('Please provide the degree or qualification for all education entries.')
          return
        }
        if (!edu.currently_studying && edu.start_year && edu.end_year) {
          if (parseInt(edu.end_year, 10) < parseInt(edu.start_year, 10)) {
            setError('Education end year cannot be earlier than start year.')
            return
          }
        }
      }
    }

    // 4. Work experience validations: If enabled, all 5 fields required & date check
    if (includeExperience) {
      if (
        !experience.company.trim() ||
        !experience.role.trim() ||
        !experience.start_date ||
        !experience.end_date ||
        !experience.location.trim()
      ) {
        setError('Please fill in all five work experience fields, or skip the experience section.')
        return
      }

      // Date validation: end_date cannot be earlier than start_date
      if (new Date(experience.end_date) < new Date(experience.start_date)) {
        setError('End date cannot be earlier than start date.')
        return
      }
    }

    setLoading(true)

    try {
      // Step 1: Check existing profile via GET /api/profiles/me/ to prevent duplicate-profile errors
      const checkResponse = await fetch(`${API_URL}/api/profiles/me/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!checkResponse.ok) {
        setError('Unable to verify existing profile. Please check your session or connection.')
        setLoading(false)
        return
      }

      const existingProfiles = await checkResponse.json()
      const profileExists = Array.isArray(existingProfiles) && existingProfiles.length > 0

      // Step 2: Create profile ONLY if it does not already exist
      if (!profileExists) {
        const profilePayload = {
          headline: profile.headline.trim(),
          linkedin_url: profile.linkedin_url.trim(),
        }

        if (profile.bio.trim()) profilePayload.bio = profile.bio.trim()
        if (profile.location.trim()) profilePayload.location = profile.location.trim()
        if (profile.website.trim()) profilePayload.website = profile.website.trim()
        if (profile.phone.trim()) {
          profilePayload.phone = parseInt(profile.phone.trim(), 10)
        }

        const profileResponse = await fetch(`${API_URL}/api/profiles/me/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profilePayload),
        })

        const profileData = await profileResponse.json()

        if (!profileResponse.ok) {
          let errorMsg = 'Failed to save profile.'
          if (Array.isArray(profileData)) {
            errorMsg = profileData[0]
          } else if (typeof profileData === 'object' && profileData !== null) {
            errorMsg = Object.values(profileData).flat().join(' ')
          }
          setError(errorMsg)
          setLoading(false)
          return
        }
      }

      // Step 3: Submit Work Experience if user opted to include it
      if (includeExperience) {
        const experiencePayload = {
          company: experience.company.trim(),
          role: experience.role.trim(),
          start_date: experience.start_date,
          end_date: experience.end_date,
          location: experience.location.trim(),
        }

        const expResponse = await fetch(`${API_URL}/api/experience/me/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(experiencePayload),
        })

        if (!expResponse.ok) {
          const expData = await expResponse.json()
          const expErrorMsg =
            typeof expData === 'object'
              ? Object.values(expData).flat().join(' ')
              : 'Profile saved, but work experience failed to save.'
          setError(expErrorMsg)
          setLoading(false)
          return
        }
      }

      setSuccess('Profile completed successfully! Redirecting...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setError('Unable to connect to the server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Top Logo */}
      <div className="mb-6 text-center">
        <Link to="/" className="text-3xl font-bold tracking-tight text-[#0A66C2]">
          Connectly
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Complete your professional profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Tell us about yourself and help others discover your professional journey.
        </p>

        {/* Feedback Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
          {/* SECTION 1: Professional Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              1. Professional Information
            </h2>

            {/* Headline */}
            <div>
              <label
                htmlFor="headline"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Professional Headline <span className="text-red-500">*</span>
              </label>
              <input
                id="headline"
                name="headline"
                type="text"
                required
                maxLength={50}
                placeholder="e.g. Software Engineer at Tech Corp"
                value={profile.headline}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Max 50 characters</p>
            </div>

            {/* LinkedIn Profile URL */}
            <div>
              <label
                htmlFor="linkedin_url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                LinkedIn Profile URL <span className="text-red-500">*</span>
              </label>
              <input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                required
                placeholder="https://linkedin.com/in/username"
                value={profile.linkedin_url}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              />
            </div>

            {/* Bio / About */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                About / Bio <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={500}
                placeholder="Brief summary of your professional background, interests, and passions..."
                value={profile.bio}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm resize-none"
              />
            </div>

            {/* Location & Website Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={profile.location}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Personal Website <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profile.website}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={profile.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* SECTION 2: Skills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                2. Skills{' '}
                <span className="text-gray-400 font-normal text-sm">
                  ({skills.length} added)
                </span>
              </h2>
            </div>

            <p className="text-xs text-gray-500">
              Highlight your technical and professional proficiencies to help recruiters and connections discover you.
            </p>

            {/* Skill Input Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value)
                    if (skillError) setSkillError('')
                  }}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Enter a skill (e.g. React, Python, SQL) and press Add or Enter"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#084e96] text-white text-sm font-medium rounded-lg transition-colors shadow-xs"
              >
                Add
              </button>
            </div>

            {skillError && (
              <p className="text-xs text-red-600 font-medium">{skillError}</p>
            )}

            {/* Added Skills Tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0A66C2] border border-blue-200 shadow-2xs"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(index)}
                      className="text-[#0A66C2] hover:text-red-600 focus:outline-none font-bold text-sm leading-none ml-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skill Suggestions / Examples */}
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                <span className="font-medium text-gray-600">Examples:</span>
                {['Java', 'Python', 'Django', 'React', 'SQL'].map((sample) => {
                  const isAdded = skills.some(
                    (s) => s.toLowerCase() === sample.toLowerCase()
                  )
                  return (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => handleAddSampleSkill(sample)}
                      disabled={isAdded}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-[#0A66C2] hover:border-blue-200 border border-transparent'
                      }`}
                    >
                      + {sample}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                3. Education{' '}
                <span className="text-gray-400 font-normal text-sm">
                  (Optional)
                </span>
              </h2>

              <button
                type="button"
                onClick={handleAddEducation}
                className="text-sm font-medium text-[#0A66C2] hover:underline"
              >
                + Add Education
              </button>
            </div>

            {educationList.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600">
                  Share your degrees, university, and academic milestones with your network.
                </p>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A66C2] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                >
                  + Add Education
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {educationList.map((edu, index) => (
                  <div
                    key={edu.id}
                    className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Education #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Institution / University */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`institution_${edu.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Institution / University
                        </label>
                        <input
                          id={`institution_${edu.id}`}
                          type="text"
                          placeholder="e.g. Stanford University, University of London"
                          value={edu.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'institution',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Degree / Qualification */}
                      <div>
                        <label
                          htmlFor={`degree_${edu.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Degree / Qualification
                        </label>
                        <input
                          id={`degree_${edu.id}`}
                          type="text"
                          placeholder="e.g. Bachelor of Science, Master of Arts"
                          value={edu.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'degree',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Field of Study */}
                      <div>
                        <label
                          htmlFor={`field_${edu.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Field of Study
                        </label>
                        <input
                          id={`field_${edu.id}`}
                          type="text"
                          placeholder="e.g. Computer Science, Economics"
                          value={edu.field_of_study}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'field_of_study',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Start Year */}
                      <div>
                        <label
                          htmlFor={`start_year_${edu.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Start Year
                        </label>
                        <input
                          id={`start_year_${edu.id}`}
                          type="number"
                          min="1950"
                          max="2035"
                          placeholder="YYYY (e.g. 2018)"
                          value={edu.start_year}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'start_year',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* End Year */}
                      <div>
                        <label
                          htmlFor={`end_year_${edu.id}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          End Year
                        </label>
                        <input
                          id={`end_year_${edu.id}`}
                          type="number"
                          min="1950"
                          max="2035"
                          disabled={edu.currently_studying}
                          placeholder={
                            edu.currently_studying ? 'Present' : 'YYYY (e.g. 2022)'
                          }
                          value={edu.currently_studying ? '' : edu.end_year}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'end_year',
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>

                      {/* Currently Studying Checkbox */}
                      <div className="sm:col-span-2 flex items-center pt-1">
                        <input
                          id={`current_${edu.id}`}
                          type="checkbox"
                          checked={edu.currently_studying}
                          onChange={(e) =>
                            handleEducationChange(
                              edu.id,
                              'currently_studying',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-[#0A66C2] border-gray-300 rounded focus:ring-[#0A66C2]"
                        />
                        <label
                          htmlFor={`current_${edu.id}`}
                          className="ml-2 text-xs font-medium text-gray-700 cursor-pointer"
                        >
                          I am currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="w-full py-2.5 border border-dashed border-gray-300 hover:border-[#0A66C2] text-sm font-medium text-gray-600 hover:text-[#0A66C2] rounded-xl transition-colors bg-white hover:bg-blue-50/50"
                >
                  + Add Another Education
                </button>
              </div>
            )}
          </div>

          {/* SECTION 4: Work Experience (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                4. Work Experience <span className="text-gray-400 font-normal text-sm">(Optional)</span>
              </h2>

              {!includeExperience ? (
                <button
                  type="button"
                  onClick={() => setIncludeExperience(true)}
                  className="text-sm font-medium text-[#0A66C2] hover:underline"
                >
                  + Add Experience
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIncludeExperience(false)
                    setExperience({
                      company: '',
                      role: '',
                      start_date: '',
                      end_date: '',
                      location: '',
                    })
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-red-600"
                >
                  Skip / Remove Experience
                </button>
              )}
            </div>

            {!includeExperience ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600">
                  Have work experience you'd like to showcase on your profile?
                </p>
                <button
                  type="button"
                  onClick={() => setIncludeExperience(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-[#0A66C2] bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                >
                  + Add Experience
                </button>
              </div>
            ) : (
              <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                {/* Company Name */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required={includeExperience}
                    placeholder="e.g. Google, Infosys, Startup"
                    value={experience.company}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                  />
                </div>

                {/* Job Title / Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Title / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    required={includeExperience}
                    placeholder="e.g. Frontend Developer"
                    value={experience.role}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                  />
                </div>

                {/* Dates: Start Date & End Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="start_date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="start_date"
                      name="start_date"
                      type="date"
                      required={includeExperience}
                      value={experience.start_date}
                      onChange={handleExperienceChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="end_date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="date"
                      required={includeExperience}
                      value={experience.end_date}
                      onChange={handleExperienceChange}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Experience Location */}
                <div>
                  <label
                    htmlFor="exp_location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exp_location"
                    name="location"
                    type="text"
                    required={includeExperience}
                    placeholder="e.g. Bangalore, India or Remote"
                    value={experience.location}
                    onChange={handleExperienceChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 5: Submission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A66C2] hover:bg-[#084e96] disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-full transition-colors shadow-sm text-sm"
            >
              {loading ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Return to Home */}
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}

export default ProfileSetup
