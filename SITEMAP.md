# FitProFinder Site Map

## 🏠 **Main Navigation Structure**

### **Public Pages**

```
FitProFinder (/)
├── Find Trainers (/search)
├── How it Works (/how-it-works)
├── For Trainers (/for-trainers)
└── Auth
    ├── Log in (Link to external auth)
    └── Sign up (Link to external auth)
```

### **Footer Navigation**

```
Footer Links
├── Company
│   ├── About (/about)
│   ├── Contact (/contact)
│   ├── Reviews (/reviews)
│   └── Pricing (/pricing)
├── Resources
│   ├── Help Center (/help)
│   ├── Resources (/resources)
│   └── Trainer Resources (/trainer-resources)
└── Legal
    ├── Privacy Policy (/privacy)
    └── Terms of Service (/terms)
```

## 📄 **Complete Page Inventory**

### **Core User Journey Pages**

| Page                   | URL              | Status  | Description                                                     |
| ---------------------- | ---------------- | ------- | --------------------------------------------------------------- |
| **Homepage**           | `/`              | ✅ Live | Main landing page with hero, search, featured trainers          |
| **Search Results**     | `/search`        | ✅ Live | Trainer search with filters (location, specialty, session type) |
| **Individual Trainer** | `/trainers/[id]` | ✅ Live | Trainer profile pages                                           |

### **Authentication & Onboarding**

| Page               | URL                | Status  | Description              |
| ------------------ | ------------------ | ------- | ------------------------ |
| **Client Signup**  | `/auth/signup`     | ✅ Live | Client registration page |
| **Trainer Signup** | `/trainers/signup` | ✅ Live | Trainer onboarding page  |

### **Information Pages**

| Page             | URL             | Status  | Description                              |
| ---------------- | --------------- | ------- | ---------------------------------------- |
| **How it Works** | `/how-it-works` | ✅ Live | 3-step process for clients               |
| **For Trainers** | `/for-trainers` | ✅ Live | Business growth page for trainers        |
| **About**        | `/about`        | ✅ Live | Company mission, values, team            |
| **Contact**      | `/contact`      | ✅ Live | Contact form and support info            |
| **Pricing**      | `/pricing`      | ✅ Live | Transparent pricing for clients/trainers |
| **Reviews**      | `/reviews`      | ✅ Live | Success stories and testimonials         |

### **Support & Resources**

| Page                  | URL                  | Status  | Description                 |
| --------------------- | -------------------- | ------- | --------------------------- |
| **Help Center**       | `/help`              | ✅ Live | FAQ and support topics      |
| **Resources**         | `/resources`         | ✅ Live | Fitness guides and articles |
| **Trainer Resources** | `/trainer-resources` | ✅ Live | Business tools for trainers |

### **Legal Pages**

| Page                 | URL        | Status  | Description                       |
| -------------------- | ---------- | ------- | --------------------------------- |
| **Privacy Policy**   | `/privacy` | ✅ Live | Data collection and usage policy  |
| **Terms of Service** | `/terms`   | ✅ Live | User agreement and platform rules |

## 🔍 **Search & Filter Functionality**

### **Homepage Search**

- Location-based search
- Quick specialty selection
- Redirects to `/search` with parameters

### **Advanced Search Page** (`/search`)

- **Location Filters**: City, State
- **Specialty Filters**: Personal Training, Yoga, Nutrition, etc.
- **Session Type**: In-person, Online, Both
- **Results Display**: Card grid with trainer info
- **URL Parameters**: Supports deep linking with search criteria

### **Featured Sections**

- **Featured Trainers**: Clickable trainer cards
- **Popular Cities**: Location-based filtering
- **Popular Categories**: Specialty-based filtering

## 🎯 **Key Interactive Elements**

### **Navigation Components**

- **Header**: Logo, main nav, auth buttons
- **Footer**: Multi-column links, social media
- **Breadcrumbs**: Search results navigation

### **Forms & Interactions**

- **Search Forms**: Homepage and search page
- **Contact Form**: Full contact form with validation
- **Newsletter Signup**: Email capture
- **Trainer Profile Actions**: Message, Book Session buttons

### **Dynamic Content**

- **Trainer Cards**: Hover effects, clickable areas
- **Filter Updates**: Real-time search filtering
- **Responsive Design**: Mobile-first approach

## 📱 **Responsive Breakpoints**

### **Mobile** (< 640px)

- Stacked navigation
- Single column layouts
- Touch-friendly buttons

### **Tablet** (640px - 1024px)

- 2-column grids
- Collapsible navigation
- Medium spacing

### **Desktop** (> 1024px)

- Multi-column layouts
- Full navigation
- Optimal spacing

## 🔗 **External Integrations**

### **Backend API** (Port 5000)

- **Trainers Endpoint**: `/api/trainers`
- **Specialties Endpoint**: `/api/trainers/specialties`
- **Individual Trainer**: `/api/trainers/[id]`

### **Third-Party Services**

- **Image Hosting**: Unsplash for trainer photos
- **Maps**: Google Maps integration (planned)
- **Payments**: Stripe integration (planned)
- **Email**: SendGrid for notifications (planned)

## 🚀 **Performance Considerations**

### **Static Generation**

- All information pages are statically generated
- Fast loading times
- SEO optimized

### **Client-Side Routing**

- Smooth navigation between pages
- Maintained scroll positions
- Loading states

### **Image Optimization**

- Responsive images
- Lazy loading
- WebP format support

## 📊 **Analytics & Tracking Points**

### **User Journey Tracking**

1. Homepage visits
2. Search interactions
3. Trainer profile views
4. Contact form submissions
5. Signup conversions

### **Performance Metrics**

- Page load times
- Search response times
- Mobile usability scores
- Core Web Vitals

---

**Last Updated**: January 2025  
**Total Pages**: 12 core pages + dynamic trainer profiles  
**Status**: All pages implemented and functional
