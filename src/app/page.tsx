'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { User } from '../types';
import { MOCK_USERS } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import MeetupFlow from '@/components/MeetupFlow';
import ProfileSidebar from '@/components/ProfileSidebar';

// Dynamically import MapComponent to disable SSR
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  loading: () => <div style={{ width: '100%', height: '100%', background: 'var(--bg-color)' }}></div>,
  ssr: false
});

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<'map' | 'meetup-offer' | 'timer' | 'confirmed'>('map');

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    if (viewState !== 'map') {
      setViewState('map');
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleSendOffer = () => {
    setViewState('meetup-offer');
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Map Layer */}
      <MapComponent users={MOCK_USERS} onUserClick={handleUserClick} />

      {/* Profile/Interaction Overlay */}
      <AnimatePresence>
        {selectedUser && viewState === 'map' && (
          <ProfileSidebar
            user={selectedUser}
            onClose={handleCloseModal}
            onOffer={handleSendOffer}
          />
        )}
      </AnimatePresence>

      {/* Meetup Flow Overlay */}
      <AnimatePresence>
        {(viewState === 'meetup-offer' || viewState === 'timer' || viewState === 'confirmed') && selectedUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '32px',
              zIndex: 1001,
              width: '90%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <MeetupFlow
              targetUser={selectedUser}
              onClose={() => setViewState('map')}
              onConfirm={() => {
                setViewState('confirmed'); // Internal state of MeetupFlow handles the UI, but we track it here too if needed
                setTimeout(() => {
                  setViewState('map');
                  setSelectedUser(null);
                }, 2000);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
