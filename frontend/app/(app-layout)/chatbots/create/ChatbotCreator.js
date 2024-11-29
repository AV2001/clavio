'use client';

import { useState } from 'react';
import LivePreview from './LivePreview';
import CreateChatbotForm from './CreateChatbotForm';
import OrganizationModal from '@/app/_components/OrganizationModal';

export default function ChatbotCreator() {
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [previewData, setPreviewData] = useState({
    chatbotName: '',
    initialMessage: '',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    chatbotBorderRadius: 0,
    fontSize: 12,
    botImage: null,
    widgetColor: '#000000',
    widgetBorderRadius: 0,
    chatbotType: 'external',
  });

  return (
    <>
      <div className='flex justify-between items-start'>
        <div className='flex-grow'>
          <CreateChatbotForm onPreviewChange={setPreviewData} />
        </div>
        {previewData.chatbotType === 'external' && (
          <div>
            <LivePreview {...previewData} />
          </div>
        )}
      </div>

      <OrganizationModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
      />
    </>
  );
}
