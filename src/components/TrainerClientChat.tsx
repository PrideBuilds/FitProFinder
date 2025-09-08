import React, { useEffect, useState } from 'react';
import { Button, Card, Loading } from './ui';
// Define TrainerClientChatProps locally since it's specific to this component
interface TrainerClientChatProps {
  appId: string;
  region: string;
  uid: string;
  name: string;
  avatar?: string;
}


const TrainerClientChat: React.FC<TrainerClientChatProps> = ({
  appId,
  region,
  uid,
  name,
  avatar,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeCometChat();
  }, [uid, name, avatar]);

  const initializeCometChat = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Initializing CometChat for user:', uid);

      // For now, let's use a simplified approach
      // Simulate successful initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsInitialized(true);
      setIsLoading(false);
      console.log('CometChat initialized successfully (simulated)');

    } catch (error) {
      console.error('CometChat initialization error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to initialize CometChat'
      );
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <Loading
        size="lg"
        text="Initializing CometChat..."
        className="h-96"
      />
    );
  }

  if (error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            CometChat Initialization Failed
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={initializeCometChat}
            variant="primary"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Loading
        size="md"
        text={`Setting up chat for ${name}...`}
        className="h-96"
      />
    );
  }

  return (
    <Card className="h-full w-full" variant="elevated">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-green-600">● Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ height: '400px' }}>
        {/* Sample conversation */}
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-800">Hi! I'm interested in personal training sessions. What packages do you offer?</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-blue-500 text-white rounded-lg px-4 py-2">
              <p className="text-sm">Hello! I'd be happy to help you with personal training. I offer 1-on-1 sessions both in-person and online. What are your fitness goals?</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">2:32 PM</p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-800">I want to lose weight and build strength. Do you have experience with weight loss programs?</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">2:35 PM</p>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-blue-500 text-white rounded-lg px-4 py-2">
              <p className="text-sm">Absolutely! I'm certified in weight loss and strength training. I can create a personalized program that combines both cardio and resistance training. Would you like to schedule a consultation?</p>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">2:37 PM</p>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="max-w-xs lg:max-w-md">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">typing...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TrainerClientChat;
