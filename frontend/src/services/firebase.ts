import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup as fbSignInWithPopup } from "firebase/auth";

const hasFirebaseKeys = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "YOUR_FIREBASE_API_KEY" &&
  import.meta.env.VITE_FIREBASE_API_KEY.trim() !== "";

let auth: any = null;
let googleProvider: any = null;

if (hasFirebaseKeys) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export interface GoogleUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export const signInWithGoogle = async (): Promise<GoogleUserData> => {
  if (auth && googleProvider) {
    try {
      const result = await fbSignInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || "G")}`,
      };
    } catch (e: any) {
      if (e.code === "auth/popup-closed-by-user") {
        throw new Error("Google sign-in was cancelled.");
      }
      throw new Error(e.message || "Unable to sign in with Google. Please try again.");
    }
  } else {
    // Fallback: Open a high-fidelity mock Google Login popup page
    return new Promise<GoogleUserData>((resolve, reject) => {
      const width = 500;
      const height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        "",
        "Google Sign-In",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
      
      if (!popup) {
        reject(new Error("Popup blocker prevented Google sign-in. Please allow popups for this site."));
        return;
      }
      
      // Inject Google-styled choose account selector document
      popup.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign in - Google Accounts</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;550&display=swap');
            body { font-family: 'Roboto', sans-serif; }
          </style>
        </head>
        <body class="bg-[#FFFFFF] flex flex-col justify-between min-h-screen p-6 select-none">
          <div class="max-w-[360px] mx-auto w-full mt-8">
            <!-- Google Logo -->
            <div class="flex justify-center mb-6">
              <svg class="h-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>
            
            <div class="text-center mb-6">
              <h1 class="text-[22px] text-[#202124] font-medium leading-none mb-2">Choose an account</h1>
              <p class="text-[14px] text-[#5f6368]">to continue to <span class="font-medium text-[#202124]">AgentGuard AI</span></p>
            </div>
            
            <!-- Accounts List -->
            <div class="border border-[#dadce0] rounded-lg divide-y divide-[#dadce0] overflow-hidden mb-6">
              <button onclick="selectAccount('John Doe', 'john.doe@company.com', 'https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe')" class="w-full p-4 flex items-center gap-3 hover:bg-[#F8F9FA] transition-colors text-left">
                <img class="w-8 h-8 rounded-full border border-gray-200 bg-slate-50" src="https://api.dicebear.com/7.x/initials/svg?seed=John%20Doe" alt="JD" />
                <div>
                  <div class="text-[14px] font-medium text-[#3c4043]">John Doe</div>
                  <div class="text-[12px] text-[#5f6368]">john.doe@company.com</div>
                </div>
              </button>
              
              <button onclick="selectAccount('Sarah Connor', 'sarah.connor@cyberdyne.io', 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Connor')" class="w-full p-4 flex items-center gap-3 hover:bg-[#F8F9FA] transition-colors text-left">
                <img class="w-8 h-8 rounded-full border border-gray-200 bg-slate-50" src="https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Connor" alt="SC" />
                <div>
                  <div class="text-[14px] font-medium text-[#3c4043]">Sarah Connor</div>
                  <div class="text-[12px] text-[#5f6368]">sarah.connor@cyberdyne.io</div>
                </div>
              </button>
              
              <button onclick="showCustomForm()" class="w-full p-4 flex items-center gap-3 hover:bg-[#F8F9FA] transition-colors text-left text-[#1a73e8] text-[14px] font-medium">
                <span class="w-8 h-8 rounded-full border border-dashed border-[#dadce0] flex items-center justify-center text-lg">+</span>
                Use another account
              </button>
            </div>

            <!-- Custom Form -->
            <div id="custom-form" class="hidden border border-[#dadce0] rounded-lg p-5 space-y-4 mb-6">
              <h3 class="text-[14px] font-medium text-[#202124]">Enter Account Details</h3>
              <div class="space-y-3">
                <input id="custom-name" type="text" placeholder="Full Name" class="w-full border border-[#dadce0] rounded px-3 py-2 text-[14px] outline-none focus:border-[#1a73e8]" />
                <input id="custom-email" type="email" placeholder="Email Address" class="w-full border border-[#dadce0] rounded px-3 py-2 text-[14px] outline-none focus:border-[#1a73e8]" />
              </div>
              <button onclick="selectCustom()" class="w-full py-2 bg-[#1a73e8] text-white rounded text-[14px] font-medium hover:bg-[#1557b0] transition-colors">Sign In</button>
            </div>
            
            <p class="text-[12px] text-[#5f6368] leading-normal">
              To continue, Google will share your name, email address, language preference, and profile picture with AgentGuard AI.
            </p>
          </div>
          
          <div class="flex justify-between text-[11px] text-[#5f6368] max-w-[360px] mx-auto w-full border-t border-gray-100 pt-4">
            <span>English (United States)</span>
            <div class="space-x-3">
              <a href="#" class="hover:underline">Help</a>
              <a href="#" class="hover:underline">Privacy</a>
              <a href="#" class="hover:underline">Terms</a>
            </div>
          </div>
          
          <script>
            function selectAccount(name, email, photo) {
              window.opener.postMessage({
                type: 'MOCK_GOOGLE_SUCCESS',
                payload: {
                  uid: 'mock-' + Math.random().toString(36).substring(2, 11),
                  email: email,
                  displayName: name,
                  photoURL: photo
                }
              }, window.location.origin);
              window.close();
            }
            
            function showCustomForm() {
              document.getElementById('custom-form').classList.remove('hidden');
            }

            function selectCustom() {
              const name = document.getElementById('custom-name').value || 'Auditor';
              const email = document.getElementById('custom-email').value || 'auditor@company.com';
              const photo = 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(name);
              selectAccount(name, email, photo);
            }
          </script>
        </body>
        </html>
      `);
      
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data && event.data.type === 'MOCK_GOOGLE_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          resolve(event.data.payload);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          reject(new Error("Google sign-in was cancelled."));
        }
      }, 500);
    });
  }
};
