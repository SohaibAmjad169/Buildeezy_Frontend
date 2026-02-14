import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DesignPreviewMode from "../../components/previewProfileDetails/DesignPreviewMode";

const UserProfilePage = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual API endpoint for fetching user profile by ID
        const response = await fetch(`/api/profile/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profileData) return <div>No profile found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      <DesignPreviewMode data={profileData} />
    </div>
  );
};

export default UserProfilePage;
