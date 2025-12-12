# WhatsApp WebView Architecture Implementation Guide

This document outlines the architecture and implementation strategy for integrating the Movescrow restaurant dashboard as a WhatsApp WebView experience.

## Overview

The restaurant dashboard will be accessible via WhatsApp Business messages, opening in WhatsApp's in-app browser (WebView) to provide a seamless, native-like experience for restaurant owners.

## Architecture Components

### 1. WhatsApp Business API Integration

#### Meta Business App Configuration
- **App Type**: WhatsApp Business Platform
- **API Version**: Latest stable version
- **Webhook**: Configured to receive incoming messages and status updates
- **Access Token**: System user token for long-term stability

#### Message Flow
```
Customer Order → Movescrow Backend → WhatsApp API → Restaurant (WebView Link) → Restaurant Dashboard
```

### 2. Deep Link Structure

#### Magic Link Format
```
https://www.movescrow.com/restaurant/auth?token={SESSION_TOKEN}&order={ORDER_ID}
```

**Components:**
- `token`: JWT or session token for authentication
- `order`: Optional order ID to auto-open specific order chat

#### Link Security
- Tokens are single-use or time-limited (24 hours)
- Tokens are tied to phone number verification
- HTTPS only
- No sensitive data in URL parameters

### 3. WebView Optimization

#### Responsive Design
- **Mobile-first**: Optimized for small screens (320px - 414px)
- **Touch-friendly**: Large tap targets (minimum 44x44px)
- **Viewport**: Proper meta tags for mobile browsers
- **Orientation**: Supports both portrait and landscape

#### Performance Optimizations
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Lazy Loading**: Defer non-critical resources
- **Minification**: Minify CSS/JS for production
- **Caching**: Appropriate cache headers for static assets
- **Compression**: Gzip/Brotli compression enabled

#### WhatsApp WebView Constraints
- **No localStorage limitations**: Standard localStorage support
- **Session Storage**: Available but ephemeral
- **Cookies**: Third-party cookies may be restricted
- **JavaScript**: Full ES6+ support
- **Network**: Subject to WhatsApp's network policies

### 4. Authentication Flow

#### Step 1: Initial Access
```
WhatsApp Message → Magic Link Click → Restaurant Dashboard (Auth Page)
```

#### Step 2: OTP Verification
```
Enter Phone → Send OTP → Verify OTP → Create Session → Dashboard
```

#### Step 3: Session Management
- **Session Token**: Stored in localStorage
- **Expiry**: 24 hours
- **Refresh**: Automatic refresh on activity
- **Logout**: Clear all session data

### 5. Real-time Updates

#### WebSocket Connection (Supabase Realtime)
- **Connection**: Establish WebSocket on dashboard load
- **Channels**: Subscribe to restaurant-specific channels
- **Events**: Order updates, new messages, status changes
- **Fallback**: Polling mechanism if WebSocket fails

#### Event Types
- `order:new` - New order received
- `order:update` - Order status changed
- `message:new` - New chat message
- `payment:update` - Payment status changed

### 6. Order Management

#### Order List View
- **Filtering**: Active, Completed, Cancelled
- **Sorting**: By date, status, amount
- **Pagination**: Load more as user scrolls
- **Pull to Refresh**: Manual refresh capability

#### Order Detail View
- **Order Information**: Items, quantities, prices
- **Customer Details**: Name, phone, address
- **Status Updates**: Real-time status changes
- **Actions**: Accept, Reject, Update Status, Mark Ready

### 7. Chat Interface

#### Chat Thread Structure
- One chat thread per order
- Thread persists for order lifecycle
- Auto-scroll to latest message
- Typing indicators (future enhancement)

#### Message Types
- **Text**: Plain text messages
- **System**: Automated system messages
- **Status**: Order status updates
- **Media**: Images (future enhancement)

#### Message Sending
- **API Endpoint**: `/api/orders/{orderId}/messages`
- **Real-time Sync**: Messages appear instantly via WebSocket
- **Offline Queue**: Queue messages if offline (future enhancement)

### 8. Notification Strategy

#### In-WebView Notifications
- **Toast Notifications**: For non-critical updates
- **Badge Counts**: Unread orders/messages count
- **Sound**: Optional sound for new orders (respects device settings)

#### WhatsApp Notifications
- **Order Alerts**: Initial order notification via WhatsApp
- **Important Updates**: Critical status changes
- **Follow-ups**: Reminders for pending actions

### 9. Error Handling

#### Network Errors
- **Offline Detection**: Show offline indicator
- **Retry Logic**: Automatic retry with exponential backoff
- **Queue Actions**: Queue user actions for retry when online

#### API Errors
- **4xx Errors**: User-friendly error messages
- **5xx Errors**: Generic error with retry option
- **Timeout Handling**: Clear timeout messages

#### WebView-Specific Issues
- **Connection Lost**: Detect and handle WebView disconnections
- **Token Expiry**: Automatic token refresh or redirect to login
- **Deep Link Errors**: Fallback to standard login flow

### 10. Security Considerations

#### Authentication
- **OTP Verification**: Secure phone-based authentication
- **Token Security**: HTTP-only cookies where possible
- **Session Management**: Secure session token storage

#### Data Protection
- **HTTPS Only**: All communications encrypted
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Content Security Policy headers
- **CSRF Protection**: Token-based CSRF protection

#### Privacy
- **Data Minimization**: Only collect necessary data
- **GDPR Compliance**: Respect user privacy preferences
- **Data Retention**: Clear data retention policies

## Implementation Phases

### Phase 1: Foundation (Current)
✅ WhatsApp Business API setup
✅ Webhook integration
✅ Basic restaurant dashboard
✅ OTP authentication
✅ Magic link generation

### Phase 2: WebView Optimization (Next)
- [ ] Optimize for WhatsApp WebView constraints
- [ ] Implement responsive mobile design
- [ ] Add offline detection and handling
- [ ] Optimize loading performance
- [ ] Test in WhatsApp WebView environment

### Phase 3: Real-time Features
- [ ] Implement Supabase Realtime subscriptions
- [ ] Add WebSocket fallback mechanism
- [ ] Real-time order updates
- [ ] Real-time chat messaging
- [ ] Live notification system

### Phase 4: Enhanced Features
- [ ] Media message support
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Order status templates
- [ ] Analytics and tracking

### Phase 5: Production Hardening
- [ ] Comprehensive error handling
- [ ] Performance monitoring
- [ ] Security audit
- [ ] Load testing
- [ ] User acceptance testing

## Technical Stack

### Frontend
- **HTML5/CSS3**: Semantic markup and modern styling
- **JavaScript (ES6+)**: Vanilla JS for lightweight bundle
- **Supabase JS**: Real-time subscriptions and database access

### Backend
- **Vercel Serverless Functions**: API endpoints
- **Supabase**: Database and real-time infrastructure
- **WhatsApp Business API**: Messaging platform

### Infrastructure
- **Vercel**: Hosting and CDN
- **Supabase**: Database, auth, and real-time
- **Termii/Twilio**: SMS provider for OTP

## Testing Strategy

### Unit Testing
- Test individual functions and components
- Mock API responses
- Test error handling paths

### Integration Testing
- Test API endpoints
- Test database operations
- Test WebSocket connections

### E2E Testing
- Test complete user flows
- Test in actual WhatsApp WebView
- Test on different devices and screen sizes

### Performance Testing
- Load testing for concurrent users
- Performance profiling
- Bundle size optimization

## Monitoring and Analytics

### Key Metrics
- **Load Time**: Time to first contentful paint
- **User Engagement**: Session duration, actions per session
- **Error Rate**: API errors, client errors
- **Message Delivery**: WhatsApp message delivery rates
- **Conversion**: Magic link click-through rate

### Tools
- **Vercel Analytics**: Performance and usage metrics
- **Supabase Dashboard**: Database and real-time metrics
- **Custom Logging**: Application-specific events
- **Error Tracking**: Error monitoring service

## Documentation

### User Documentation
- Restaurant onboarding guide
- How to use the dashboard
- Troubleshooting guide

### Developer Documentation
- Architecture documentation
- API documentation
- Deployment guide
- Contributing guidelines

## Future Enhancements

### Short-term
- Multi-language support
- Dark mode
- Push notifications (if WebView supports)
- Order templates

### Long-term
- AI-powered order predictions
- Automated order processing
- Integration with POS systems
- Advanced analytics dashboard

## Notes

- WhatsApp WebView uses Chrome/Chromium-based engine
- WebView may have different user agent than standard browsers
- Some browser APIs may be limited or unavailable
- Test thoroughly in actual WhatsApp WebView environment
- Consider progressive enhancement approach
- Maintain backward compatibility where possible

