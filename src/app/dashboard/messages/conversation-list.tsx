
"use client";

import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: { seconds: number; nanoseconds: number };
  };
}

interface UserProfile {
    id: string;
    name: string;
    profilePictureUrl: string;
}

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  isSelected: boolean;
  onSelect: (id: string, recipientId: string) => void;
}

function ConversationListItem({ conversation, currentUserId, isSelected, onSelect }: ConversationListItemProps) {
  const firestore = useFirestore();
  const recipientId = conversation.participantIds.find(id => id !== currentUserId);

  const recipientProfileRef = useMemoFirebase(() => {
    if(!firestore || !recipientId) return null;
    return doc(firestore, 'users', recipientId);
  }, [firestore, recipientId]);
  
  const { data: recipientProfile, isLoading } = useDoc<UserProfile>(recipientProfileRef);

  if (isLoading) return <ConversationSkeleton />;
  if (!recipientProfile) return null;

  return (
    <button
      onClick={() => onSelect(conversation.id, recipientId!)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors",
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      <Avatar>
        <AvatarImage src={recipientProfile.profilePictureUrl} alt={recipientProfile.name} />
        <AvatarFallback>{recipientProfile.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate">
        <div className="flex items-baseline justify-between">
          <p className="font-semibold">{recipientProfile.name}</p>
          {conversation.lastMessage?.createdAt && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt.seconds * 1000), { addSuffix: true })}
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage?.senderId === currentUserId && 'You: '}
            {conversation.lastMessage?.text || 'No messages yet...'}
        </p>
      </div>
    </button>
  );
}


function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        </div>
    )
}

interface ConversationListProps {
  onConversationSelect: (id: string, recipientId: string) => void;
  selectedConversationId: string | null;
}

export function ConversationList({ onConversationSelect, selectedConversationId }: ConversationListProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const conversationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
  }, [user, firestore]);

  const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {conversations?.map((convo) => (
        <ConversationListItem
          key={convo.id}
          conversation={convo}
          currentUserId={user!.uid}
          isSelected={selectedConversationId === convo.id}
          onSelect={onConversationSelect}
        />
      ))}
    </div>
  );
}

    