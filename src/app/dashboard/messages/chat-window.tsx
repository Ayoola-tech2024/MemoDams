
"use client";

import { useState } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, doc, where, getDocs, writeBatch } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

interface UserProfile {
    id: string;
    name: string;
    profilePictureUrl: string;
}

interface ChatWindowProps {
  conversationId: string;
  recipientId: string;
  onBack: () => void;
}

export function ChatWindow({ conversationId, recipientId, onBack }: ChatWindowProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState('');

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !conversationId) return null;
    return query(
      collection(firestore, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  }, [firestore, conversationId]);
  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const recipientProfileRef = useMemoFirebase(() => {
    if(!firestore || !recipientId) return null;
    return doc(firestore, 'users', recipientId);
  }, [firestore, recipientId]);
  const { data: recipientProfile, isLoading: isLoadingProfile } = useDoc<UserProfile>(recipientProfileRef);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !conversationId || newMessage.trim() === '') return;

    const messageData = {
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp(),
    };
    
    const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
    const conversationDocRef = doc(firestore, 'conversations', conversationId);

    try {
        const batch = writeBatch(firestore);
        batch.set(doc(messagesColRef), messageData);
        batch.update(conversationDocRef, {
            'lastMessage.text': newMessage,
            'lastMessage.senderId': user.uid,
            'lastMessage.createdAt': serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        await batch.commit();
        setNewMessage('');
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };
  
  if (isLoadingMessages || isLoadingProfile) {
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center gap-4 border-b p-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-3/4 ml-auto" />
                <Skeleton className="h-10 w-1/2" />
            </div>
            <div className="border-t p-4">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 border-b p-4">
         <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar>
          <AvatarImage src={recipientProfile?.profilePictureUrl} />
          <AvatarFallback>{recipientProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{recipientProfile?.name}</h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.senderId !== user?.uid && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={recipientProfile?.profilePictureUrl} />
                   <AvatarFallback>{recipientProfile?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs rounded-lg px-3 py-2 md:max-w-md lg:max-w-lg ${
                  msg.senderId === user?.uid
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                 <p className={`text-xs mt-1 ${ msg.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground' }`}>
                    {msg.createdAt ? format(new Date(msg.createdAt.seconds * 1000), 'p') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

    