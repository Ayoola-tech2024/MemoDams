
"use client";

import { useState } from 'react';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { StartConversationDialog } from './start-conversation-dialog';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, MessageSquare } from 'lucide-react';
import { useUser } from '@/firebase';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<{ id: string, recipientId: string } | null>(null);
  const { user } = useUser();

  const handleSelectConversation = (id: string, recipientId: string) => {
    setSelectedConversation({ id, recipientId });
  };

  if (!user) return null;

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div className="col-span-1 flex flex-col border-r">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <StartConversationDialog
            currentUserId={user.uid}
            onConversationCreated={handleSelectConversation}
            trigger={
              <Button variant="ghost" size="icon">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            }
          />
        </div>
        <ConversationList 
            onConversationSelect={handleSelectConversation}
            selectedConversationId={selectedConversation?.id || null}
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3">
        {selectedConversation ? (
          <ChatWindow
            key={selectedConversation.id}
            conversationId={selectedConversation.id}
            recipientId={selectedConversation.recipientId}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center bg-muted/30 rounded-lg">
            <MessageSquare className="h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
            <p className="text-muted-foreground">Or start a new one to begin messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}

    