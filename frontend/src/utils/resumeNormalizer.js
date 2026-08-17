/**
 * normalizes a string, array, or object into a flat array of strings.
 */
function toFlatStringArray(data) {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    // If it's an array, flatten it and ensure all elements are strings
    return data.flat(Infinity).map(item => String(item).trim()).filter(Boolean);
  }
  
  if (typeof data === 'object') {
    // If it's a dictionary (e.g. {"Programming": ["Python", "Java"]})
    // Extract all values, flatten them, and convert to strings
    const allValues = Object.values(data);
    return toFlatStringArray(allValues);
  }
  
  if (typeof data === 'string') {
    // If it's a comma-separated string, split it
    return data.split(',').map(s => s.trim()).filter(Boolean);
  }
  
  // Fallback for numbers, booleans, etc.
  return [String(data).trim()];
}

/**
 * Normalizes array of objects, ensuring description is an array of strings
 */
function normalizeObjectArray(data, templateKeys) {
  if (!data) return [];
  
  let arr = [];
  if (Array.isArray(data)) {
    arr = data;
  } else if (typeof data === 'object') {
    arr = Object.values(data); // best effort extraction
  } else {
    return []; // Invalid structure, drop it
  }
  
  return arr.map(item => {
    if (typeof item !== 'object' || item === null) return null;
    
    const normalizedItem = {};
    for (const key of templateKeys) {
      if (key === 'description') {
        normalizedItem[key] = toFlatStringArray(item[key]);
      } else {
        normalizedItem[key] = item[key] ? String(item[key]).trim() : "";
      }
    }
    return normalizedItem;
  }).filter(Boolean);
}

/**
 * Universal Resume Normalizer
 * Ensures that whatever structure the backend/AI provides, the UI receives a strictly typed object.
 */
export function normalizeResumeData(data) {
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.warn("Failed to parse resume string to JSON", e);
      return {};
    }
  }

  if (typeof data !== 'object' || data === null) {
    return {};
  }

  const normalized = {
    personalDetails: {
      name: data.personalDetails?.name ? String(data.personalDetails.name).trim() : "",
      email: data.personalDetails?.email ? String(data.personalDetails.email).trim() : "",
      phone: data.personalDetails?.phone ? String(data.personalDetails.phone).trim() : "",
      location: data.personalDetails?.location ? String(data.personalDetails.location).trim() : "",
      linkedin: data.personalDetails?.linkedin ? String(data.personalDetails.linkedin).trim() : "",
      github: data.personalDetails?.github ? String(data.personalDetails.github).trim() : "",
      portfolio: data.personalDetails?.portfolio ? String(data.personalDetails.portfolio).trim() : "",
    },
    summary: data.summary ? String(data.summary).trim() : (data.objective ? String(data.objective).trim() : ""),
    skills: toFlatStringArray(data.skills),
    experience: normalizeObjectArray(data.experience, ['title', 'company', 'date', 'description']),
    projects: normalizeObjectArray(data.projects, ['title', 'technologies', 'date', 'description']),
    education: normalizeObjectArray(data.education, ['degree', 'institution', 'date']),
    certifications: normalizeObjectArray(data.certifications || data.certificates, ['name', 'issuer']),
    languages: toFlatStringArray(data.languages),
    achievements: toFlatStringArray(data.achievements)
  };

  return normalized;
}
