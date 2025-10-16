import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, FileText, TreePine, Sprout, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const FarmerRegistrationDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    farmSize: '',
    practices: [],
    phoneNumber: '',
    email: '',
    language: 'en',
    landTenure: {
      ownershipType: '',
      documentNumber: '',
      expiryDate: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'success' | 'error' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Available climate-smart practices from the API documentation
  const availablePractices = [
    'no-till',
    'cover-cropping',
    'agroforestry',
    'rotational-grazing',
    'composting',
    'improved-fallow',
    'silvopasture',
    'water-conservation'
  ];

  const practiceLabels = {
    'no-till': 'No-Till Farming',
    'cover-cropping': 'Cover Cropping',
    'agroforestry': 'Agroforestry',
    'rotational-grazing': 'Rotational Grazing',
    'composting': 'Composting',
    'improved-fallow': 'Improved Fallow',
    'silvopasture': 'Silvopasture',
    'water-conservation': 'Water Conservation'
  };

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Swahili' },
    { code: 'fr', name: 'French' },
    { code: 'ki', name: 'Kikuyu' },
    { code: 'luo', name: 'Luo' }
  ];

  const ownershipTypes = [
    { value: 'owned', label: 'Owned' },
    { value: 'leased', label: 'Leased' },
    { value: 'communal', label: 'Communal' }
  ];

  // Validation function based on API requirements
  const validateForm = () => {
    const newErrors: any = {};

    // Name validation (2-100 characters)
    if (!formData.name.trim()) {
      newErrors.name = 'Full legal name is required';
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }

    // Location validation (GPS coordinates format)
    if (!formData.location.trim()) {
      newErrors.location = 'GPS coordinates are required';
    } else if (!/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(formData.location)) {
      newErrors.location = 'GPS coordinates must be in "lat,lng" format (e.g., -1.2921,36.8219)';
    }

    // Farm size validation (0.5 - 1000 hectares)
    const farmSize = parseFloat(formData.farmSize);
    if (!formData.farmSize) {
      newErrors.farmSize = 'Farm size is required';
    } else if (isNaN(farmSize) || farmSize < 0.5 || farmSize > 1000) {
      newErrors.farmSize = 'Farm size must be between 0.5 and 1000 hectares';
    }

    // Practices validation (at least one required)
    if (formData.practices.length === 0) {
      newErrors.practices = 'At least one climate-smart practice must be selected';
    }
    // Phone validation (optional but if provided, should be valid)
    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Email validation (optional but if provided, should be valid)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Land tenure validation
    if (formData.landTenure.ownershipType && !formData.landTenure.documentNumber) {
      newErrors.landTenure = 'Document number is required when ownership type is specified';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLandTenureChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      landTenure: { ...prev.landTenure, [field]: value }
    }));
  };

  const handlePracticesChange = (practice: string) => {
    setFormData(prev => ({
      ...prev,
      practices: prev.practices.includes(practice)
        ? prev.practices.filter(p => p !== practice)
        : [...prev.practices, practice]
    }));
    // Clear practices error
    if (errors.practices) {
      setErrors(prev => ({ ...prev, practices: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Get current user profile for owner_id
      const {
        data: profileData,
        error: profileError
      } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", formData.email)
        .single();

      let ownerId = profileData?.user_id;
      // If not found, fallback to current session user
      if (!ownerId) {
        const {
          data: { user },
          error: sessionError
        } = await supabase.auth.getUser();
        ownerId = user?.id;
      }
      if (!ownerId) {
        setSubmitError("Could not determine owner for this farm. Please ensure the user is registered.");
        setRegistrationStatus('error');
        setIsSubmitting(false);
        return;
      }

      // Parse location
      let latitude = null, longitude = null;
      if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(formData.location)) {
        const [lat, lng] = formData.location.split(',').map(Number);
        latitude = lat;
        longitude = lng;
      }

      // Insert farm/project into Supabase
      const { error: insertError } = await supabase
        .from("farms")
        .insert({
          owner_id: ownerId,
          name: formData.name,
          location: formData.location,
          size_hectares: parseFloat(formData.farmSize),
          practices: formData.practices,
          latitude,
          longitude,
          status: "active",
          description: `Registered via dashboard. Language: ${formData.language}. Land Tenure: ${formData.landTenure.ownershipType}, Doc: ${formData.landTenure.documentNumber}`,
          soil_type: null,
          climate_zone: null,
          established_date: null
        });
      if (insertError) {
        setSubmitError(insertError.message);
        setRegistrationStatus('error');
      } else {
        setRegistrationStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            location: '',
            farmSize: '',
            practices: [],
            phoneNumber: '',
            email: '',
            language: 'en',
            landTenure: {
              ownershipType: '',
              documentNumber: '',
              expiryDate: ''
            }
          });
          setRegistrationStatus(null);
        }, 3000);
      }
    } catch (error) {
      setSubmitError(error.message || String(error));
      setRegistrationStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-12 px-0 flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-6xl bg-card border border-primary/20 rounded-2xl shadow-xl px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Register New Farmer</h1>
            <p className="text-muted-foreground">
              Complete the form below to register a new farmer in the carbon credit program.
            </p>
          </div>

          {registrationStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Registration Successful!</h3>
                <p className="text-green-700">The farmer has been successfully registered in the system.</p>
              </div>
            </div>
          )}

          {registrationStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Registration Failed</h3>
                <p className="text-red-700">There was an error registering the farmer. Please try again.</p>
                {submitError && <p className="text-red-700 mt-2 text-sm">{submitError}</p>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ...existing code for fields... */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="Enter farmer's full legal name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    GPS Coordinates *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="e.g., -1.2921,36.8219"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-destructive">{errors.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Farm Size (hectares) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="1000"
                    value={formData.farmSize}
                    onChange={(e) => handleInputChange('farmSize', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="Enter farm size"
                  />
                  {errors.farmSize && (
                    <p className="mt-1 text-sm text-destructive">{errors.farmSize}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Contact Information */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ...existing code for fields... */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="e.g., +254712345678"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="farmer@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Climate-Smart Practices */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <TreePine className="h-5 w-5" />
                Climate-Smart Practices *
              </h2>
              <p className="text-muted-foreground mb-4">
                Select all climate-smart agricultural practices currently implemented on the farm:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ...existing code for fields... */}
                {availablePractices.map(practice => (
                  <label key={practice} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.practices.includes(practice)}
                      onChange={() => handlePracticesChange(practice)}
                      className="rounded border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-sm text-foreground">{practiceLabels[practice]}</span>
                  </label>
                ))}
              </div>
              {errors.practices && (
                <p className="mt-3 text-sm text-destructive">{errors.practices}</p>
              )}
            </div>
            {/* Land Tenure */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Land Tenure Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ...existing code for fields... */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ownership Type
                  </label>
                  <select
                    value={formData.landTenure.ownershipType}
                    onChange={(e) => handleLandTenureChange('ownershipType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  >
                    <option value="">Select ownership type</option>
                    {ownershipTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Document Number
                  </label>
                  <input
                    type="text"
                    value={formData.landTenure.documentNumber}
                    onChange={(e) => handleLandTenureChange('documentNumber', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                    placeholder="Enter document number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.landTenure.expiryDate}
                    onChange={(e) => handleLandTenureChange('expiryDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
              {errors.landTenure && (
                <p className="mt-3 text-sm text-destructive">{errors.landTenure}</p>
              )}
            </div>
            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: '',
                    location: '',
                    farmSize: '',
                    practices: [],
                    phoneNumber: '',
                    email: '',
                    language: 'en',
                    landTenure: {
                      ownershipType: '',
                      documentNumber: '',
                      expiryDate: ''
                    }
                  });
                  setErrors({});
                }}
                className="px-6 py-2 border rounded-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Register Farmer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FarmerRegistrationDashboard;
