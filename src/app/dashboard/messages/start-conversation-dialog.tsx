
"use client";

import { useState, type ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, writeBatch, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string;
}

interface StartConversationDialogProps {
  trigger: ReactElement;
  currentUserId: string;
  onConversationCreated: (conversationId: string, recipientId: string) => void;
}

// Generates a consistent, ordered ID for a conversation between two users
const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
}

export function StartConversationDialog({ trigger, currentUserId, onConversationCreated }: StartConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2 || !firestore) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const usersRef = collection(firestore, "users");
      // Search by name, case-insensitive
      const q = query(usersRef, where("name", ">=", term), where("name", "<=", term + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const users: UserSearchResult[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUserId) {
          users.push({ id: doc.id, ...doc.data() } as UserSearchResult);
        }
      });
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users: ", error);
      toast({ variant: "destructive", title: "Search Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversation = async (recipient: UserSearchResult) => {
    if (!firestore) return;

    const conversationId = getConversationId(currentUserId, recipient.id);
    const conversationRef = doc(firestore, 'conversations', conversationId);

    try {
        const conversationSnap = await getDoc(conversationRef);

        if (conversationSnap.exists()) {
            // Conversation already exists, just open it
            onConversationCreated(conversationId, recipient.id);
            handleClose();
            return;
        }

        // If not, create a new one using a batch write
        const batch = writeBatch(firestore);
        
        const conversationData = {
            participantIds: [currentUserId, recipient.id],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: {
                text: "Conversation started",
                senderId: currentUserId,
                createdAt: serverTimestamp(),
            },
        };
        batch.set(conversationRef, conversationData);

        // Add conversation reference to both users' subcollections
        const currentUserConversationsRef = doc(firestore, 'users', currentUserId, 'conversations', conversationId);
        const recipientConversationsRef = doc(firestore, 'users', recipient.id, 'conversations', conversationId);

        batch.set(currentUserConversationsRef, { conversationId: conversationId });
        batch.set(recipientConversationsRef, { conversationId: conversationId });

        await batch.commit();

        toast({ title: "Conversation Started", description: `You can now message ${recipient.name}.` });
        onConversationCreated(conversationId, recipient.id);
        handleClose();
    } catch (error) {
        console.error("Error starting conversation: ", error);
        toast({ variant: "destructive", title: "Failed to start conversation" });
    }
  };
  
  const handleClose = () => {
    setOpen(false);
    resetState();
  }

  const resetState = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Conversation</DialogTitle>
          <DialogDescription>Search for a user by their name to start chatting.</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <ScrollArea className="mt-4 h-[200px]">
            {isLoading ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-48" /></div>
                    <div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div>
                </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profilePictureUrl} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartConversation(user)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" /> Message
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                    No users found.
                </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    