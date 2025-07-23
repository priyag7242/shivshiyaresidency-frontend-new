import React from 'react';

const SafeRooms = React.lazy(() => import('../pages/Rooms'));

export default function SafeRoomsWrapper() {
  return (
    <React.Suspense 
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-500 mx-auto mb-4"></div>
            <p className="text-golden-400">Loading Rooms...</p>
          </div>
        </div>
      }
    >
      <SafeRooms />
    </React.Suspense>
  );
}