'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile, Theme } from '../types/interfaces';
import { defaultThemes } from '../constants/themes';
import { updateProfile } from "firebase/auth";
import { Timestamp } from 'firebase/firestore';
import { 
  sendEmailVerification, 
  linkWithPopup, 
  GoogleAuthProvider,
  EmailAuthProvider,
  unlink,
  AuthProvider
} from "firebase/auth";
import { toast } from "sonner";
import { RequireVerification } from '@/components/require-verification';
import CryptoJS from 'crypto-js'; // Import the encryption library

export default function AccountPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    totalQuizPoints: 0,
    points: 0,
    lastQuizDate: null as Timestamp | null,
  });
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [isUserIdFeatureEnabled, setUserIdFeatureEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(user)
        const isGoogleUser = user.providerData[0]?.providerId === 'google.com';
        const profile: UserProfile = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: isGoogleUser ? 'google' : 'email',
          uid: user.uid,
        };
        setUserProfile(profile);
        setDisplayName(user.displayName || '');
        
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || '');
          setProfileImage(userData.profileImage || user.photoURL);
          setStats({
            totalQuizzesTaken: userData.totalQuizzesTaken || 0,
            totalQuizPoints: userData.totalQuizPoints || 0,
            points: userData.points || 0,
            lastQuizDate: userData.lastQuizDate || null,
          });
          if (userData.currentTheme) {
            setCurrentTheme(userData.currentTheme);
          }
          profile.lastUpdated = userData.lastUpdated;
          console.log(profile)
        }
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    setIsLoading(true);
    try {
      let imageUrl = profileImage;

      // Upload new image if selected
      if (imageFile) {
        const imageRef = ref(storage, `profile-images/${userProfile.uid}/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Encrypt the Gemini API Key before saving
      const encryptedApiKey = CryptoJS.AES.encrypt(geminiApiKey, process.env.NEXT_ENCRYPT_KEY || 'cantsay').toString();

      // Update Firestore document
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, {
        displayName,
        bio,
        profileImage: imageUrl,
        lastUpdated: new Date(),
        geminiApiKey: encryptedApiKey // Save the encrypted key
      });

      // Update auth profile if name changed
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
      }

      // Show success message (you'll need to implement toast notifications)
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;
    
    setIsVerifyingEmail(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (!auth.currentUser) return;
    
    setIsLinkingAccount(true);
    try {
      await linkWithPopup(auth.currentUser, googleProvider);
      toast.success('Successfully linked Google account!');
    } catch (error) {
      console.error('Error linking Google account:', error);
      toast.error('Failed to link Google account. Please try again.');
    } finally {
      setIsLinkingAccount(false);
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    if (!auth.currentUser) return;
    
    // Prevent unlinking if it's the only provider
    if (auth.currentUser.providerData.length <= 1) {
      toast.error('Cannot unlink the only authentication method.');
      return;
    }

    try {
      await unlink(auth.currentUser, providerId);
      toast.success('Successfully unlinked provider.');
    } catch (error) {
      console.error('Error unlinking provider:', error);
      toast.error('Failed to unlink provider. Please try again.');
    }
  };

  // Decrypt the API Key for display
  const decryptedApiKey = (key: string) => {
    const bytes = CryptoJS.AES.decrypt(key, process.env.NEXT_ENCRYPT_KEY || 'cant say');
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  // Function to handle long press
  const handleLongPressStart = () => {
    setShowUserId(true);
  };

  const handleLongPressEnd = () => {
    setShowUserId(false);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.background }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: currentTheme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-opacity-10 to-opacity-30" 
         style={{ 
           backgroundColor: currentTheme.background,
           color: currentTheme.text,
           backgroundImage: `linear-gradient(to bottom right, ${currentTheme.primary}15, ${currentTheme.secondary}15)`
         }}>
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-opacity-50" 
                   style={{ backgroundColor: `${currentTheme.secondary}30` }}>
            <TabsTrigger value="profile" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80">
              Profile
            </TabsTrigger>
            <TabsTrigger value="stats" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80">
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <RequireVerification
              fallback={
                <div className="p-4 rounded-lg bg-yellow-50/10 border border-yellow-500/20">
                  <p className="text-yellow-500 text-sm">
                    Please verify your email to access profile settings.
                    {!auth.currentUser?.emailVerified && (
                      <Button
                        onClick={handleSendVerificationEmail}
                        variant="link"
                        size="sm"
                        className="text-yellow-600 underline ml-2"
                      >
                        Verify now
                      </Button>
                    )}
                  </p>
                </div>
              }
            >
              <Card className="border-none shadow-lg backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${currentTheme.background}95, ${currentTheme.secondary}20)`,
                      borderColor: currentTheme.primary 
                    }}>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription style={{ color: currentTheme.secondary }}>
                    Update your profile information and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar 
                        className="h-24 w-24 ring-2 ring-offset-2 transition-transform hover:scale-105"
                        style={{ 
                          '--tw-ring-color': currentTheme.primary,
                          '--tw-ring-offset-color': currentTheme.background 
                        } as React.CSSProperties}
                        onMouseDown={handleLongPressStart}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressEnd}
                        id="profile-pic"
                      >
                        <AvatarImage src={profileImage || ''} />
                        <AvatarFallback style={{ backgroundColor: currentTheme.secondary }}>
                          {displayName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{userProfile?.uid}</p>
                        {isUserIdFeatureEnabled && showUserId && (
                          <p className="text-sm text-gray-500" id="user-id-display">User ID: {userProfile?.uid}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Last Updated: {userProfile?.lastUpdated ? new Date(userProfile.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="profile-image"
                        />
                        <Label
                          htmlFor="profile-image"
                          className="cursor-pointer px-4 py-2 rounded-md transition-all hover:scale-105 hover:shadow-md"
                          style={{ 
                            background: `linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                            color: currentTheme.text 
                          }}
                        >
                          Change Profile Picture
                        </Label>
                      </div>
                    </div>

                    <RequireVerification
                      fallback={
                        <div className="p-4 rounded-lg bg-yellow-50/10 border border-yellow-500/20">
                          <p className="text-yellow-500 text-sm">
                            Please verify your email to access profile settings.
                            {!auth.currentUser?.emailVerified && (
                              <Button
                                onClick={handleSendVerificationEmail}
                                variant="link"
                                size="sm"
                                className="text-yellow-600 underline ml-2"
                              >
                                Verify now
                              </Button>
                            )}
                          </p>
                        </div>
                      }
                    >
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="transition-all focus:scale-[1.02]"
                          style={{ 
                            backgroundColor: `${currentTheme.secondary}30`,
                            color: currentTheme.text 
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="transition-all focus:scale-[1.02]"
                          style={{ 
                            backgroundColor: `${currentTheme.secondary}30`,
                            color: currentTheme.text 
                          }}
                        />
                      </div>
                    </RequireVerification>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                        <button 
                          onClick={() => setShowModal(true)} 
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          aria-label="More information about Gemini API Key"
                        >
                          ?
                        </button>
                      </div>
                      <div className="flex items-center">
                        <Input
                          id="geminiApiKey"
                          type={showApiKey ? 'text' : 'password'} // Change input type based on visibility
                          onChange={(e) => setGeminiApiKey(e.target.value)} // Allow editing of the API key
                          className="transition-all focus:scale-[1.02]"
                          style={{ 
                            backgroundColor: `${currentTheme.secondary}30`,
                            color: currentTheme.text 
                          }}
                        />
                        <button 
                          onClick={() => setShowApiKey(!showApiKey)} // Toggle visibility
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                        >
                          {showApiKey ? '👁️' : '👁️‍🗨️'} {/* Eye icon to show/hide */}
                        </button>
                      </div>
                    </div>

                    {showModal && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <h2 className="text-lg font-semibold">Gemini API Key Information</h2>
                          <p className="mb-4">Here is how to obtain your Gemini API Key:</p>
                          <iframe 
                            width="560" 
                            height="315" 
                            src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                          <button 
                            onClick={() => setShowModal(false)} 
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 mt-6 pt-6 border-t">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold">Email Verification</h3>
                        {auth.currentUser?.emailVerified ? (
                          <div className="flex items-center gap-2 text-green-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Email verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="text-yellow-500">Email not verified</span>
                            <Button
                              onClick={handleSendVerificationEmail}
                              disabled={isVerifyingEmail}
                              variant="outline"
                              size="sm"
                              className="transition-all hover:scale-105"
                              style={{ 
                                borderColor: currentTheme.primary,
                                color: currentTheme.primary 
                              }}
                            >
                              {isVerifyingEmail ? 'Sending...' : 'Send Verification Email'}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Linked Accounts</h3>
                        <div className="space-y-2">
                          {auth.currentUser?.providerData.map((provider) => (
                            <div key={provider.providerId} className="flex items-center justify-between p-3 rounded-lg"
                                 style={{ backgroundColor: `${currentTheme.secondary}20` }}>
                              <div className="flex items-center gap-2">
                                {provider.providerId === 'google.com' && (
                                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    {/* Add Google icon SVG path here */}
                                  </svg>
                                )}
                                <span>{provider.providerId === 'password' ? 'Email' : 
                                      provider.providerId === 'google.com' ? 'Google' : 
                                      provider.providerId}</span>
                              </div>
                              <Button
                                onClick={() => handleUnlinkProvider(provider.providerId)}
                                variant="ghost"
                                size="sm"
                                className="hover:text-red-500"
                              >
                                Unlink
                              </Button>
                            </div>
                          ))}

                          {!auth.currentUser?.providerData.some(p => p.providerId === 'google.com') && (
                            <Button
                              onClick={handleLinkGoogle}
                              disabled={isLinkingAccount}
                              className="w-full transition-all hover:scale-105"
                              style={{ 
                                background: `linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                                color: currentTheme.text 
                              }}
                            >
                              {isLinkingAccount ? 'Linking...' : 'Link Google Account'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading}
                    className="transition-all hover:scale-105 hover:shadow-md"
                    style={{ 
                      background: `linear-gradient(45deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                      color: currentTheme.text 
                    }}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </RequireVerification>
          </TabsContent>

          <TabsContent value="stats">
            <RequireVerification
              fallback={
                <Card className="border-none shadow-lg backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Stats Locked</CardTitle>
                    <CardDescription>
                      Verify your email to view your learning progress and achievements.
                    </CardDescription>
                  </CardHeader>
                </Card>
              }
            >
              <Card className="border-none shadow-lg backdrop-blur-sm"
                    style={{ 
                      background: `linear-gradient(135deg, ${currentTheme.background}95, ${currentTheme.secondary}20)`,
                      borderColor: currentTheme.primary 
                    }}>
                <CardHeader>
                  <CardTitle>Your Stats</CardTitle>
                  <CardDescription style={{ color: currentTheme.secondary }}>
                    View your learning progress and achievements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-lg transition-all hover:scale-[1.02] hover:shadow-md"
                         style={{ 
                           background: `linear-gradient(135deg, ${currentTheme.secondary}30, ${currentTheme.primary}20)`
                         }}>
                      <div className="text-sm font-medium" style={{ color: currentTheme.secondary }}>Total Points</div>
                      <div className="text-3xl font-bold mt-2">{stats.points}</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary + '20' }}>
                      <div className="text-sm" style={{ color: currentTheme.secondary }}>Quizzes Completed</div>
                      <div className="text-2xl font-bold">{stats.totalQuizzesTaken}</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary + '20' }}>
                      <div className="text-sm" style={{ color: currentTheme.secondary }}>Quiz Points Earned</div>
                      <div className="text-2xl font-bold">{stats.totalQuizPoints}</div>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentTheme.secondary + '20' }}>
                      <div className="text-sm" style={{ color: currentTheme.secondary }}>Last Quiz</div>
                      <div className="text-2xl font-bold">
                        {stats.lastQuizDate ? new Date(stats.lastQuizDate.seconds * 1000).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RequireVerification>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 