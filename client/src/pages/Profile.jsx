import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';

const Profile = () => {
    const { user, setUser, axios } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);

    // Individual states for each field
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [location, setLocation] = useState(user?.location || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [image, setImage] = useState(null); // For the new file
    const [preview, setPreview] = useState(user?.image || ''); // For the preview

    // Sync individual states with user only when NOT editing
    useEffect(() => {
        if (user && !isEditing) {
            setName(user.name);
            setPhone(user.phone || '');
            setLocation(user.location || '');
            setBio(user.bio || '');
            setPreview(user.image || '');
            setImage(null);
        }
    }, [user, isEditing]);

    const handleCancel = () => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            setLocation(user.location || '');
            setBio(user.bio || '');
            setPreview(user.image || '');
        }
        setImage(null);
        setIsEditing(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('location', location);
            formData.append('bio', bio);
            if (image) {
                formData.append('image', image);
            }

            const { data } = await axios.post('/api/user/update-profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success(data.message);
                setUser(data.user);
                setIsEditing(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (!user) return <div className="mt-24 text-center">Please login to view profile</div>;

    return (
        <div className="mt-16 max-w-4xl mx-auto px-4 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-gray-100 p-8 rounded-2xl shadow-sm mb-8 transition-all hover:shadow-md">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-inner bg-gray-50 flex items-center justify-center relative">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <img src={assets.profile_icon} alt="Profile" className="w-full h-full object-cover opacity-50" />
                        )}

                        {isEditing && (
                            <label htmlFor="profile-image" className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">Change Photo</span>
                                <input
                                    type="file"
                                    id="profile-image"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-semibold text-gray-800">{user.name}</h1>
                    <p className="text-gray-500 mt-1">{user.email}</p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20 italic">Verified Buyer</span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100 italic">Active Member</span>
                    </div>
                </div>
                <div className="md:ml-auto flex items-center gap-3">
                    {isEditing && (
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 rounded-full font-medium transition-all duration-300 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-8 py-2.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow active:scale-95 ${isEditing
                            ? 'bg-primary text-white hover:bg-primary-dull'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {isEditing ? 'Save Profile' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                    <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Personal Information
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-gray-400 font-medium block mb-2">Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow relative z-10"
                                />
                            ) : (
                                <p className="text-gray-700 font-medium px-4 py-3 bg-gray-50/50 rounded-xl">{name}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 font-medium block mb-2">Email Address</label>
                            <p className="text-gray-500 font-medium px-4 py-3 bg-gray-100/50 rounded-xl border border-gray-100 select-none">
                                {user.email} <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-400 ml-2">PRIMARY</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact & Location */}
                <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                    <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        Contact & Location
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-gray-400 font-medium block mb-2">Phone Number</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    placeholder="+91 00000 00000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow relative z-10"
                                />
                            ) : (
                                <p className={`px-4 py-3 rounded-xl ${phone ? 'text-gray-700 bg-gray-50/50 font-medium' : 'text-gray-400 italic bg-gray-50/30'}`}>
                                    {phone || 'Add phone number...'}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 font-medium block mb-2">Location</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    placeholder="City, State, Country"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow relative z-10"
                                />
                            ) : (
                                <p className={`px-4 py-3 rounded-xl ${location ? 'text-gray-700 bg-gray-50/50 font-medium' : 'text-gray-400 italic bg-gray-50/30'}`}>
                                    {location || 'Set your location...'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* About Me / Bio - Extra detail as suggested */}
                <div className="md:col-span-2 bg-white border border-gray-100 p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                    <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                        About Me
                    </h2>
                    {isEditing ? (
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="4"
                            placeholder="Tell us something about yourself..."
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-shadow resize-none relative z-10"
                        ></textarea>
                    ) : (
                        <p className={`line-height-relaxed ${bio ? 'text-gray-600 font-medium' : 'text-gray-400 italic'}`}>
                            {bio || 'Your bio is currently empty. Share a bit about your shopping preferences!'}
                        </p>
                    )}
                </div>
            </div>

            {/* Account Settings Placeholder */}
            <div className="mt-12 text-center">
                <p className="text-gray-400 text-sm">Member since March 2026</p>
            </div>
        </div>
    );
};

export default Profile;
