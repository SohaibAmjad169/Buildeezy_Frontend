/**
 * Profile completion utilities
 * Calculates profile completion percentage based on filled fields
 * Includes basic profile fields + Design tab + Portfolio + Past Clients
 */

/**
 * Calculate comprehensive profile completion percentage
 * @param {Array} profileFields - Array of basic profile field objects
 * @param {Object} designData - Profile design data (banner, content, etc.)
 * @param {Array} portfolioData - Portfolio projects array
 * @param {Array} pastClientsData - Past clients array
 * @param {Object} profileData - Full profile data object (for avatar, etc.)
 * @returns {Object} { percentage, completedFields, totalFields, missingFields }
 */
export const calculateProfileCompletion = (profileFields, designData = null, portfolioData = null, pastClientsData = null, profileData = null) => {
  console.debug('=== Profile Completion Calculation ===');
  console.debug('User Type:', profileData?.userType);
  console.debug('Portfolio Data:', portfolioData);
  console.debug('Past Clients Data:', pastClientsData);
  
  if (!profileFields || !Array.isArray(profileFields)) {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: 0,
      missingFields: [],
    };
  }

  const completedFields = [];
  const missingFields = [];

  // 1. Basic Profile Fields (required fields from personal info)
  const requiredFields = profileFields.filter(field => 
    field?.validation?.required === true
  );

  requiredFields.forEach(field => {
    const isCompleted = isFieldCompleted(field);
    
    if (isCompleted) {
      completedFields.push({
        id: field.id,
        title: field.title,
        value: field.value,
        category: 'basic'
      });
    } else {
      missingFields.push({
        id: field.id,
        title: field.title,
        type: field.type,
        required: true,
        category: 'basic'
      });
    }
  });

  // 2. Profile Photo Requirement
  const profilePhotoRequirements = [
    {
      id: 'avatar',
      title: 'Profile Photo',
      check: () => {
        return profileData?.avatar && 
               profileData.avatar !== '' && 
               !profileData.avatar.includes('/default.png') && 
               !profileData.avatar.includes('/dafault.png');
      },
      category: 'basic'
    }
  ];

  // 3. Design Requirements
  const designRequirements = [
    {
      id: 'banner',
      title: 'Profile Banner',
      check: () => designData?.layout?.banner && designData.layout.banner !== null && designData.layout.banner !== '',
      category: 'design'
    }
  ];

  // 3. Content Requirements 
  const contentRequirements = [
    {
      id: 'skills',
      title: 'Skills & Expertise',
      check: () => designData?.content?.skills && Array.isArray(designData.content.skills) && designData.content.skills.length > 0,
      category: 'content'
    },
    {
      id: 'certifications',
      title: 'Certifications',
      check: () => {
        const certs = designData?.content?.certifications;
        return certs && Array.isArray(certs) && certs.length > 0 && 
               certs.some(cert => cert.title && cert.title.trim() !== '');
      },
      category: 'content'
    },
    {
      id: 'introVideo',
      title: 'Introduction Video',
      check: () => designData?.content?.introVideo && designData.content.introVideo !== null && designData.content.introVideo !== '',
      category: 'content'
    }
  ];

  // 4. Portfolio Requirements (for vendors, contractors, specialists)
  const portfolioRequirements = [];
  if (profileData?.userType === 'vendor' || 
      profileData?.userType === 'contractor' || 
      profileData?.userType === 'specialist') {
    portfolioRequirements.push({
      id: 'portfolio',
      title: 'Portfolio Projects (min. 1)',
      check: () => {
        console.debug('Portfolio check - portfolioData:', portfolioData);
        console.debug('Portfolio check - is array:', Array.isArray(portfolioData));
        console.debug('Portfolio check - length:', portfolioData?.length);
        const result = portfolioData && Array.isArray(portfolioData) && portfolioData.length >= 1;
        console.debug('Portfolio check - result:', result);
        return result;
      },
      category: 'portfolio'
    });
  }

  // 5. Past Clients Requirements (for contractors, specialists)
  const clientRequirements = [];
  if (profileData?.userType === 'contractor' || 
      profileData?.userType === 'specialist') {
    clientRequirements.push({
      id: 'pastClients',
      title: 'Past Clients (min. 2)',
      check: () => {
        console.debug('Past clients check - pastClientsData:', pastClientsData);
        console.debug('Past clients check - is array:', Array.isArray(pastClientsData));
        console.debug('Past clients check - length:', pastClientsData?.length);
        const result = pastClientsData && Array.isArray(pastClientsData) && pastClientsData.length >= 2;
        console.debug('Past clients check - result:', result);
        return result;
      },
      category: 'clients'
    });
  }

  // Check all additional requirements
  const allAdditionalRequirements = [
    ...profilePhotoRequirements,
    ...designRequirements,
    ...contentRequirements,
    ...portfolioRequirements,
    ...clientRequirements
  ];

  allAdditionalRequirements.forEach(requirement => {
    const isCompleted = requirement.check();
    console.debug(`Checking requirement ${requirement.id}: ${isCompleted ? 'COMPLETED' : 'MISSING'}`);
    
    if (isCompleted) {
      completedFields.push({
        id: requirement.id,
        title: requirement.title,
        category: requirement.category
      });
    } else {
      missingFields.push({
        id: requirement.id,
        title: requirement.title,
        required: true,
        category: requirement.category
      });
    }
  });

  const totalFields = requiredFields.length + allAdditionalRequirements.length;
  const completedCount = completedFields.length;
  const percentage = totalFields > 0 ? Math.round((completedCount / totalFields) * 100) : 0;

  console.debug('Profile completion breakdown:', {
    basicFields: requiredFields.length,
    profilePhotoFields: profilePhotoRequirements.length,
    designFields: designRequirements.length,
    contentFields: contentRequirements.length,
    portfolioFields: portfolioRequirements.length,
    clientFields: clientRequirements.length,
    totalFields,
    completedCount,
    percentage,
    missingFields: missingFields.map(f => `${f.title} (${f.category})`)
  });

  return {
    percentage,
    completedFields: completedCount,
    totalFields,
    missingFields,
  };
};

/**
 * Check if a single field is completed
 * @param {Object} field - Profile field object
 * @returns {boolean} - True if field has valid value
 */
export const isFieldCompleted = (field) => {
  if (!field || !field.validation?.required) return true;

  const { value, type, id } = field;

  // Debug logging for troubleshooting
  console.debug(`Checking field ${id} (${type}):`, value);

  switch (type) {
    case 'doubleInput':
      // For name fields with first and last name
      return value && value.first && value.first.trim() !== '' && 
             value.second && value.second.trim() !== '';
    
    case 'multipleSelect':
      // For arrays (like categories, skills)
      return Array.isArray(value) && value.length > 0;
    
    case 'select':
    case 'autoComplete':
      // For select/autocomplete fields (country, city, etc.)
      if (!value) return false;
      
      // Handle object with name or label property
      if (typeof value === 'object') {
        return value.name && value.name.trim() !== '' || 
               value.label && value.label.trim() !== '' ||
               value.id || 
               (Object.keys(value).length > 0 && !value.name && !value.label);
      }
      
      // Handle string values
      if (typeof value === 'string') {
        return value.trim() !== '';
      }
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      return false;
    
    case 'upload':
      // For file uploads (documents, photos)
      return value && value !== '';
    
    case 'contact':
      // For phone number fields
      return value && typeof value === 'string' && value.trim() !== '';
    
    case 'description':
    case 'textarea':
      // For description/textarea fields
      return value && typeof value === 'string' && value.trim() !== '';
    
    case 'text':
    case 'email':
    case 'phone':
    default:
      // For text-based fields
      return value && typeof value === 'string' && value.trim() !== '';
  }
};

/**
 * Get profile completion status with message
 * @param {number} percentage - Completion percentage
 * @returns {Object} { status, message, color, priority }
 */
export const getProfileCompletionStatus = (percentage) => {
  if (percentage >= 90) {
    return {
      status: 'excellent',
      message: 'Profile is almost complete!',
      color: 'success',
      priority: 'low'
    };
  } else if (percentage >= 70) {
    return {
      status: 'good',
      message: 'Profile is looking good, add a few more details',
      color: 'success',
      priority: 'low'
    };
  } else if (percentage >= 50) {
    return {
      status: 'average',
      message: 'Profile needs more information to be competitive',
      color: 'warning',
      priority: 'medium'
    };
  } else if (percentage >= 30) {
    return {
      status: 'poor',
      message: 'Profile is incomplete, please add more details',
      color: 'error',
      priority: 'high'
    };
  } else {
    return {
      status: 'critical',
      message: 'Profile completion is required to continue',
      color: 'error',
      priority: 'critical'
    };
  }
};

/**
 * Check if profile redirection is needed based on completion
 * @param {number} percentage - Completion percentage
 * @param {number} threshold - Minimum required percentage (default: 50)
 * @returns {boolean} - True if user should be redirected to profile
 */
export const shouldRedirectToProfile = (percentage, threshold = 50) => {
  return percentage <= threshold;
};

/**
 * Get next most important fields to complete
 * @param {Array} missingFields - Array of missing field objects
 * @param {number} limit - Number of fields to return (default: 3)
 * @returns {Array} - Array of prioritized missing fields
 */
export const getPriorityMissingFields = (missingFields, limit = 3) => {
  if (!missingFields || !Array.isArray(missingFields)) {
    return [];
  }

  // Define field priority order (higher priority fields should be completed first)
  const fieldPriority = {
    // Basic profile fields - highest priority
    'name': 10,
    'avatar': 9,
    'email': 9,
    'phoneNumber': 8,
    
    // Portfolio & Clients - high priority for professional credibility
    'portfolio': 8,
    'pastClients': 7,
    
    // Location & basic info
    'country': 7,
    'city': 6,
    'description': 6,
    'category': 5,
    'experienceLevel': 5,
    
    // Design & Content fields
    'banner': 5,
    'skills': 4,
    'certifications': 4,
    'introVideo': 3,
    
    // Other fields
    'bio': 2,
    'awards': 1
  };

  const prioritizedFields = missingFields
    .map(field => ({
      ...field,
      priority: fieldPriority[field.id] || 0
    }))
    .sort((a, b) => b.priority - a.priority);
  
  console.debug('All missing fields with priorities:', prioritizedFields);
  console.debug('Returning top', limit, 'fields:', prioritizedFields.slice(0, limit));
  
  return prioritizedFields.slice(0, limit);
};