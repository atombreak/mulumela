'use client';
import { SignUp } from '@clerk/nextjs';

const MulumelaSignUp = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          
          <span className="text-3xl font-bold text-gray-900">Mulumela</span>
        </div>
      </div>

      <SignUp 
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-md',
            card: 'shadow-none border-0 bg-transparent',
            headerTitle: 'text-2xl font-bold text-gray-900',
            headerSubtitle: 'text-gray-600',
            socialButtonsIconButton: 'border-gray-300 hover:bg-gray-50',
            formFieldInput: 'rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg',
            footerActionLink: 'text-blue-600 hover:text-blue-500',
            identityPreviewEditButton: 'text-blue-600 hover:text-blue-500',
            formResendCodeLink: 'text-blue-600 hover:text-blue-500',
            otpCodeFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          },
        }}
        signInUrl="/auth/signin"
        redirectUrl="/api/auth/callback"
        afterSignUpUrl="/api/auth/callback"
      />
    </div>
  );
};

export default MulumelaSignUp; 