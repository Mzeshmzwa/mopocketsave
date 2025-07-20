# Chat App Documentation

## Overview

The chat application was a comprehensive real-time messaging system built with React Native and Firebase, designed to facilitate communication between different types of users, particularly focusing on cooperatives and individuals within the ESNYCA (Eswatini National Youth Cooperative Association) ecosystem.

## Core Features

### 1. Real-time Messaging
- **Instant Communication**: Messages were delivered in real-time using Firebase Firestore's `onSnapshot` listeners
- **Message Status**: Support for read/unread message tracking
- **Message Types**: Text-based messaging with timestamp tracking
- **Conversation Threading**: Messages organized in conversation threads between participants

### 2. User Management
- **Role-based Access**: Different user roles (individual, cooperative, admin)
- **User Discovery**: Automatic discovery of available chat partners based on user roles
- **Profile Integration**: Chat integrated with user profiles including display names and profile pictures

### 3. Chat List Management
- **Conversation Sorting**: Chats sorted by most recent message timestamp
- **Last Message Preview**: Display of the most recent message in each conversation
- **Unread Count Badges**: Visual indicators for unread messages in each chat
- **Active Chat Tracking**: System to track which chat is currently active

### 4. Notification System
- **Toast Notifications**: Real-time toast notifications for new messages
- **Smart Notifications**: Notifications only shown when user is not actively viewing the chat
- **Sender Information**: Notifications include sender name and unread count

## Technical Architecture

### Context Management (`ChatContext.js`)
The chat system was built around a React Context that managed:

```javascript
// Core State Management
const [chatList, setChatList] = useState([]);           // Available users to chat with
const [conversations, setConversations] = useState({}); // All conversation data
const [lastMessages, setLastMessages] = useState({});   // Last message timestamps
const [unreadCounts, setUnreadCounts] = useState({});   // Unread message counts
const [userMap, setUserMap] = useState({});             // User data mapping
```

### Firebase Integration
- **Firestore Collections**:
  - `users`: User profiles and role information
  - `chats`: Chat metadata and participant lists
  - `chats/{chatId}/messages`: Individual messages within conversations

- **Real-time Listeners**:
  - User list updates for chat partner discovery
  - Message updates for active conversations
  - Automatic cleanup of invalid user references

### Message Management
- **Read Status Tracking**: Batch updates to mark messages as read
- **Message Validation**: Filtering out messages from non-existent users
- **Conversation Cleanup**: Automatic removal of conversations with deleted users

## User Experience Features

### 1. Role-based Chat Discovery
- **Individuals**: Could chat with cooperatives
- **Cooperatives**: Could chat with all other users
- **Automatic Filtering**: System automatically showed relevant chat partners based on user role

### 2. Message Read Tracking
- **Visual Indicators**: Unread messages clearly marked
- **Automatic Read Marking**: Messages marked as read when conversation is viewed
- **Batch Processing**: Efficient batch updates for read status

### 3. Smart Notifications
- **Context Awareness**: No notifications when actively viewing a chat
- **Rich Information**: Notifications included sender name and message count
- **Auto-dismiss**: Notifications automatically cleared when messages were read

## Data Flow

### 1. Chat Initialization
```
User Login → Fetch Available Chat Partners → Subscribe to Existing Chats → Load Message History
```

### 2. Message Sending
```
Compose Message → Validate Recipients → Save to Firestore → Real-time Propagation → Update UI
```

### 3. Message Reception
```
Firestore Update → Context State Update → UI Refresh → Notification (if applicable) → Read Status Update
```

## Security & Data Management

### 1. User Validation
- **Existence Checks**: Regular validation that chat partners still exist in the system
- **Role Verification**: Ensuring users can only chat with appropriate roles
- **Data Cleanup**: Automatic removal of conversations with deleted users

### 2. Privacy Features
- **Participant-based Access**: Only chat participants could access conversation data
- **Role-based Discovery**: Users only discovered appropriate chat partners

### 3. Performance Optimization
- **Efficient Queries**: Optimized Firestore queries to minimize data transfer
- **Batch Operations**: Batch updates for read status to reduce API calls
- **Memory Management**: Proper cleanup of listeners to prevent memory leaks

## Integration Points

### 1. Authentication System
- Integrated with Firebase Authentication
- User role management through custom user profiles
- Automatic chat access based on authentication status

### 2. Profile Management
- Profile pictures displayed in chat interfaces
- Display names used for chat identification
- Role information used for chat partner filtering

### 3. Navigation System
- Deep linking to specific conversations
- Integration with app-wide navigation patterns
- Proper back navigation handling

## Removed Components

When the chat system was removed, the following components were eliminated:

1. **ChatContext Provider** - Real-time chat state management
2. **Chat Tab** - Main chat interface in bottom navigation
3. **Message Components** - Individual message rendering
4. **Chat List Interface** - Conversation list management
5. **Notification System** - Toast notifications for new messages
6. **Firebase Chat Collections** - Backend data structure for messages

## Migration Impact

The removal of the chat system simplified the application by:
- Reducing Firebase dependencies and costs
- Simplifying the navigation structure
- Removing complex real-time state management
- Eliminating notification complexity
- Focusing the app on its core financial/cooperative features

The chat functionality was replaced with more focused features like Transactions and Profile management, aligning better with the app's primary purpose as a cooperative and financial management platform.