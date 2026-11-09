import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Utensils, QrCode, Receipt, MessageSquare, BarChart3, ShieldCheck, Package,
  ArrowRight, Check, Lock, Zap, Star, GraduationCap, Building2, UserCog,
  ChevronLeft, ChevronRight, Clock, Coffee, Sun, Moon, HelpCircle,
  ChevronDown, CheckCircle2, Shield, Sparkles, AlertCircle
} from "lucide-react";

const slides = [
  {
    id: 1,
    tag: "CAMPUS DINING HALL",
    title: "Nutritious & Chef-Curated Campus Meals",
    subtitle: "Freshly prepared breakfast, lunch, high tea, and dinner served daily under strict quality and hygiene standards at IIIT Bhubaneswar.",
    badge: "4 Fresh Meals Daily",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    metric: "1,200+ Residents Served Daily",
    highlight: "Strict FSSAI Hygiene Standards"
  },
  {
    id: 2,
    tag: "INSTANT VERIFICATION",
    title: "Sub-Second Contactless QR Check-In",
    subtitle: "Single-tap cryptographic QR meal passes generated right on your smartphone. Completely eliminates mess token queues.",
    badge: "Sub-2s Scan Speed",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80",
    metric: "100% Anti-Duplicate Verification",
    highlight: "Real-time Counter Scan"
  },
  {
    id: 3,
    tag: "FINANCIAL TRANSPARENCY",
    title: "Itemized Billing & Instant Online Settlement",
    subtitle: "Transparent ledger tracking every meal consumed, automatic rebates for approved leaves, and instant digital UPI payments.",
    badge: "Immutable Ledger",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1600&q=80",
    metric: "0 Hidden Charges",
    highlight: "Automated Monthly Invoices"
  },
  {
    id: 4,
    tag: "SUSTAINABILITY & AUDIT",
    title: "Zero Waste & Intelligent Pantry Management",
    subtitle: "Predictive ingredient planning, daily food wastage tracking, and institutional audits by hostel wardens to keep food sustainable.",
    badge: "Green Campus Initiative",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80",
    metric: "35% Food Wastage Reduction",
    highlight: "Real-time Stock Monitoring"
  }
];

const mealSchedules = [
  {
    name: "Breakfast",
    time: "07:30 AM – 09:30 AM",
    icon: Coffee,
    desc: "Idli, Dosa, Poha, Paratha, boiled eggs/sprouts, fresh seasonal fruits, hot tea & milk.",
    startHour: 7.5,
    endHour: 9.5
  },
  {
    name: "Lunch",
    time: "12:00 PM – 02:15 PM",
    icon: Sun,
    desc: "Steamed rice, chapati, dal tadka, seasonal sabzi, paneer/chicken gravy, curd & papad.",
    startHour: 12.0,
    endHour: 14.25
  },
  {
    name: "Evening Snacks",
    time: "05:00 PM – 06:15 PM",
    icon: Utensils,
    desc: "Samosas, vegetable cutlets, pakoras, biscuits, fresh ginger tea & filter coffee.",
    startHour: 17.0,
    endHour: 18.25
  },
  {
    name: "Dinner",
    time: "07:45 PM – 09:45 PM",
    icon: Moon,
    desc: "Warm rotis, pulao/jeera rice, mixed vegetable curry, dal makhani, egg curry/paneer & sweet dessert.",
    startHour: 19.75,
    endHour: 21.75
  }
];

const features = [
  {
    icon: Utensils,
    title: "Dynamic Menus",
    desc: "Real-time daily updates with detailed dietary labels, allergen alerts, and calorie breakdowns across all 4 daily meals.",
    tag: "Real-Time Menu"
  },
  {
    icon: QrCode,
    title: "Instant QR Check-In",
    desc: "Signed, short-lived meal passes with automated duplicate prevention and manual search fallback for counter staff.",
    tag: "Sub-2s Counter Scans"
  },
  {
    icon: Receipt,
    title: "Itemized Billing",
    desc: "Transparent monthly statements with immutable snapshots, complete payment history, and downloadable PDF invoices.",
    tag: "Instant Digital Payments"
  },
  {
    icon: MessageSquare,
    title: "Grievance Desk",
    desc: "Categorized student complaints with priority levels, image uploads, and full resolution timelines managed by admins.",
    tag: "Fast Turnaround"
  },
  {
    icon: Package,
    title: "Inventory & Wastage",
    desc: "Automated pantry stock register with low-stock alerts, supplier management, and daily food waste tracking.",
    tag: "Sustainable Operations"
  },
  {
    icon: BarChart3,
    title: "Warden Analytics",
    desc: "Comprehensive dashboards covering student attendance, rebate requests, financial reconciliations, and audit trails.",
    tag: "Institutional Control"
  }
];

const steps = [
  {
    n: "01",
    title: "Admin Publishes Menu",
    desc: "Mess administration plans and publishes daily meal options, nutritional values, and registration cutoffs."
  },
  {
    n: "02",
    title: "Student Confirms & Gets QR",
    desc: "Students browse the daily menu on their phone, confirm meal attendance, and generate an authenticated QR pass."
  },
  {
    n: "03",
    title: "Sub-Second Counter Check-In",
    desc: "Present your signed QR pass at the mess entrance. A single scan verifies attendance and prevents duplicate meals."
  }
];

const roleDetails = [
  {
    id: "students",
    icon: GraduationCap,
    name: "Students",
    title: "Student Dining Portal",
    desc: "Empowering residents with real-time dining access, contactless QR check-ins, transparent ledgers, and fast grievance redressal.",
    points: [
      "View today's dynamic menu with allergen and nutrition alerts",
      "Generate encrypted QR meal passes on your smartphone",
      "Track itemized consumption bills and settle instantly via UPI & Net Banking",
      "Submit leave requests for meal rebates and file complaints"
    ]
  },
  {
    id: "admins",
    icon: ShieldCheck,
    name: "Mess Admins",
    title: "Central Mess Administration",
    desc: "Comprehensive operational control over campus meals, inventory procurement, pricing, and complaint turnaround.",
    points: [
      "Create, schedule, and publish menus for all 4 daily meals",
      "Manage meal pricing, billing cycles, and payment reconciliations",
      "Review and resolve student grievances with photo attachments",
      "Approve inventory replenishment requests from kitchen staff"
    ]
  },
  {
    id: "wardens",
    icon: Building2,
    name: "Hostel Wardens",
    title: "Institutional Oversight & Audit",
    desc: "High-level institutional dashboards to inspect hostel dining standards, attendance compliance, and financial records.",
    points: [
      "Access institutional analytics for attendance, feedback, and costs",
      "Audit daily food wastage reports and kitchen sustainability",
      "Inspect student leave applications and rebate approvals",
      "Broadcast critical hostel-wide dining announcements"
    ]
  },
  {
    id: "staff",
    icon: UserCog,
    name: "Kitchen Staff",
    title: "Kitchen & Counter Terminal",
    desc: "Fast, ergonomic tools designed for counter operations during peak meal rushes and pantry record keeping.",
    points: [
      "High-speed camera scanner for instant QR verification",
      "Manual enrollment number fallback search for offline students",
      "Record daily food wastage logs by meal category",
      "Submit pantry grocery replenishment requests to administration"
    ]
  }
];

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "3rd Year, Computer Science & Engineering",
    text: "The QR check-in is lightning fast. I used to stand in long token queues every afternoon, but now scanning my phone takes barely 3 seconds. The menu updates are always accurate.",
    rating: 5
  },
  {
    name: "Sneha Patel",
    role: "2nd Year, Electronics & Communication",
    text: "The billing system is completely transparent. I can review every single dinner or lunch I had in the month with date and time stamps. Applying for mess leave rebate is completely automatic.",
    rating: 5
  },
  {
    name: "Rohan Reddy",
    role: "4th Year, Information Technology",
    text: "Whenever we flag an issue on the grievance portal, the mess admin team responds within hours with resolution photos. It transformed how our hostel dining operates.",
    rating: 5
  }
];

const faqs = [
  {
    q: "How does the QR check-in work at the mess entrance?",
    a: "When you log into your student portal, you can generate a digital QR meal pass for the current meal. At the mess counter, staff scan your QR code with their camera terminal. The pass is cryptographically verified in milliseconds, preventing duplicate entries."
  },
  {
    q: "Can I apply for mess rebates during vacations or leaves?",
    a: "Yes. Students can submit leave requests directly through the portal with start and end dates. Once approved by the hostel warden or administration, meal charges for the absent period are automatically deducted from your billing ledger."
  },
  {
    q: "How are payments settled in the mess portal?",
    a: "The portal supports instant digital payments (UPI, QR Scan, Debit Cards, Net Banking) with automated verification and institutional billing reconciliation. Every payment generates an instant downloadable invoice."
  },
  {
    q: "What should I do if I have dietary preferences or allergies?",
    a: "Every published daily menu displays detailed dietary markers, vegetarian/non-vegetarian indicators, and allergen warnings (such as dairy, nuts, or gluten) so you can make informed meal choices."
  },
  {
    q: "How do I report a quality or hygiene grievance?",
    a: "Go to the Complaints section in your student dashboard, select a category (Food Quality, Hygiene, Staff Behavior, Billing), attach supporting photographs if needed, and submit. You can track the admin's live resolution notes in real-time."
  }
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto-advance slides every 5.5 seconds unless paused
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Determine current active meal timing based on client time
  const getCurrentMealStatus = () => {
    const now = new Date();
    const currentDecHour = now.getHours() + now.getMinutes() / 60;
    const activeMeal = mealSchedules.find(
      (m) => currentDecHour >= m.startHour && currentDecHour < m.endHour
    );
    return activeMeal ? activeMeal.name : "Dining Hall Closed / Next Meal Scheduled";
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  const currentMealName = getCurrentMealStatus();
  const activeRole = roleDetails[activeRoleIndex];
  const ActiveRoleIcon = activeRole.icon;

  return (
    <div className="landing">
      {/* Top Notice Marquee Bar */}
      <div className="landing-top-bar">
        <div className="landing-top-bar-inner">
          <div className="landing-top-badge">
            <span className="live-pulse" />
            LIVE CAMPUS STATUS
          </div>
          <div className="landing-top-marquee">
            <span>
              IIIT BHUBANESWAR CENTRAL MESS &bull; SERVING 1,200+ RESIDENT STUDENTS &bull; CURRENT SERVICE: <strong>{currentMealName}</strong> &bull; 100% CONTACTLESS QR MEAL PASSES &bull; ZERO FOOD WASTE INITIATIVE &bull; FSSAI COMPLIANT DINING FACILITY
            </span>
          </div>
          <div className="landing-top-time">
            <Clock size={13} />
            <span>Dining Hours: 07:30 AM &ndash; 09:45 PM</span>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="landing-nav">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-logo-wrap">
            <img src="/favicon.svg" alt="IIIT Logo" width="30" height="30" />
          </div>
          <div className="landing-brand-text">
            <strong>IIIT BHUBANESWAR</strong>
            <span>CENTRAL MESS PORTAL</span>
          </div>
        </Link>

        <nav className="landing-nav-links">
          <a href="#schedule">Meal Schedule</a>
          <a href="#features">Capabilities</a>
          <a href="#how">How It Works</a>
          <a href="#roles">Role Portals</a>
          <a href="#faq">FAQs</a>
        </nav>

        <div className="landing-nav-cta">
          <Link to="/login" className="landing-btn landing-btn-ghost">
            Sign In
          </Link>
          <Link to="/register" className="landing-btn landing-btn-solid">
            Register <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero Section with Interactive Slider */}
      <section className="landing-hero-v2">
        <div className="landing-hero-v2-container">
          {/* Header Typography */}
          <div className="landing-hero-header">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              OFFICIAL CENTRAL MESS MANAGEMENT SYSTEM &bull; IIIT BHUBANESWAR
            </div>
            <h1>
              INTELLIGENT CAMPUS DINING.<br />
              <span className="hero-title-accent">REFINED FOR EVERY RESIDENT.</span>
            </h1>
            <p className="landing-hero-description">
              The unified digital platform connecting students, mess administrators, hostel wardens,
              and kitchen staff. Experience instant QR passes, dynamic allergen menus, itemized ledgers,
              and fast grievance turnaround.
            </p>
            <div className="landing-hero-cta-row">
              <Link to="/login" className="landing-btn landing-btn-solid landing-btn-lg">
                Enter Portal <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="landing-btn landing-btn-ghost landing-btn-lg">
                Register as Student
              </Link>
              <a href="#schedule" className="landing-btn landing-btn-subtle landing-btn-lg">
                <Clock size={16} /> View Today's Timings
              </a>
            </div>
          </div>

          {/* Interactive Image Carousel / Slider */}
          <div
            className="landing-carousel-wrapper"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Carousel Inner Slides */}
            <div className="landing-carousel-viewport">
              {slides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`landing-carousel-slide ${isActive ? "active" : ""}`}
                    style={{
                      opacity: isActive ? 1 : 0,
                      pointerEvents: isActive ? "auto" : "none",
                      transform: isActive ? "scale(1)" : "scale(1.03)",
                      transition: "opacity 0.6s ease, transform 0.6s ease"
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="landing-carousel-img"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    <div className="landing-carousel-overlay" />
                    
                    {/* Content Box Over Slide */}
                    <div className="landing-carousel-caption">
                      <div className="carousel-caption-meta">
                        <span className="carousel-tag">{slide.tag}</span>
                        <span className="carousel-badge">{slide.badge}</span>
                      </div>
                      <h3>{slide.title}</h3>
                      <p>{slide.subtitle}</p>
                      
                      <div className="carousel-caption-footer">
                        <div className="carousel-stat-pill">
                          <CheckCircle2 size={15} />
                          <span>{slide.metric}</span>
                        </div>
                        <div className="carousel-stat-pill">
                          <Sparkles size={15} />
                          <span>{slide.highlight}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Left / Right Controls */}
            <button
              className="carousel-control-btn prev"
              onClick={prevSlide}
              aria-label="Previous Slide"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="carousel-control-btn next"
              onClick={nextSlide}
              aria-label="Next Slide"
            >
              <ChevronRight size={22} />
            </button>

            {/* Slide Navigation Dots & Counter */}
            <div className="carousel-bottom-bar">
              <div className="carousel-counter">
                <strong>0{currentSlide + 1}</strong>
                <span>/</span>
                <span>0{slides.length}</span>
              </div>
              <div className="carousel-dots">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    className={`carousel-dot ${idx === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <span className="dot-inner" />
                  </button>
                ))}
              </div>
              <div className="carousel-status-indicator">
                <span className={`status-pulse ${isPaused ? "paused" : "running"}`} />
                <span>{isPaused ? "Paused" : "Auto-Playing"}</span>
              </div>
            </div>
          </div>

          {/* Quick Trust Bar */}
          <div className="landing-quick-trust">
            <div className="trust-item">
              <Lock size={16} />
              <div>
                <strong>Role-Based Access</strong>
                <span>Secure access for students, staff & wardens</span>
              </div>
            </div>
            <div className="trust-item">
              <Zap size={16} />
              <div>
                <strong>Instant QR Passes</strong>
                <span>Zero duplicate tokens, verified in 2 seconds</span>
              </div>
            </div>
            <div className="trust-item">
              <Shield size={16} />
              <div>
                <strong>Institutional Oversight</strong>
                <span>Real-time pantry audits & student complaint tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Meal Schedule Section */}
      <section id="schedule" className="landing-section schedule-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Daily Schedule & Service Timings</span>
          <h2>Four Nutritious Meals. Every Single Day.</h2>
          <p>
            The central mess operates strictly on scheduled meal slots with hot, hygienic food served on time.
            Registered students can present their QR pass during these windows.
          </p>
        </div>

        <div className="schedule-grid">
          {mealSchedules.map((meal) => {
            const MealIcon = meal.icon;
            const isNow = currentMealName === meal.name;
            return (
              <div
                key={meal.name}
                className={`schedule-card ${isNow ? "schedule-card-active" : ""}`}
              >
                <div className="schedule-card-header">
                  <div className="schedule-icon-wrap">
                    <MealIcon size={22} />
                  </div>
                  {isNow && (
                    <span className="schedule-live-pill">
                      <span className="live-dot" /> ACTIVE NOW
                    </span>
                  )}
                </div>
                <div className="schedule-time-row">
                  <Clock size={14} />
                  <span>{meal.time}</span>
                </div>
                <h3>{meal.name}</h3>
                <p>{meal.desc}</p>
                <div className="schedule-footer">
                  <Link to="/login" className="schedule-link">
                    Reserve Meal <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Institutional Numbers / Stats */}
      <section className="landing-metrics-bar">
        <div className="metrics-inner">
          <div className="metric-box">
            <strong>1,200+</strong>
            <span>Active Student Residents</span>
          </div>
          <div className="metric-box">
            <strong>4</strong>
            <span>Dedicated User Roles</span>
          </div>
          <div className="metric-box">
            <strong>&lt; 2s</strong>
            <span>Average Counter Verification</span>
          </div>
          <div className="metric-box">
            <strong>100%</strong>
            <span>Transparent Itemized Billing</span>
          </div>
        </div>
      </section>

      {/* Core Capabilities / Bento Grid */}
      <section id="features" className="landing-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Engineered For Excellence</span>
          <h2>Comprehensive Mess Management Capabilities</h2>
          <p>
            Engineered specifically for university dining halls. Every capability is connected to our
            central MongoDB database with zero simulated data.
          </p>
        </div>

        <div className="capabilities-bento">
          {features.map(({ icon: Icon, title, desc, tag }) => (
            <div key={title} className="bento-card">
              <div className="bento-top">
                <div className="bento-icon">
                  <Icon size={22} />
                </div>
                <span className="bento-tag">{tag}</span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="landing-section workflow-section">
        <div className="landing-section-head" style={{ textAlign: "center", margin: "0 auto 50px" }}>
          <span className="landing-eyebrow">Seamless Experience</span>
          <h2>Three Steps. Completely Contactless.</h2>
          <p style={{ maxWidth: 650, margin: "0 auto" }}>
            From menu publication to dining hall tray collection, the entire workflow is digitized.
          </p>
        </div>

        <div className="workflow-steps">
          {steps.map((step) => (
            <div key={step.n} className="workflow-card">
              <div className="workflow-num-badge">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <div className="workflow-arrow-line" />
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Role Portals */}
      <section id="roles" className="landing-section roles-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Role-Based Ecosystem</span>
          <h2>Built For Every Campus Stakeholder</h2>
          <p>
            Every user sees a purpose-built workspace tailored to their exact responsibilities.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs-bar">
          {roleDetails.map((role, idx) => {
            const Icon = role.icon;
            const isSelected = idx === activeRoleIndex;
            return (
              <button
                key={role.id}
                className={`role-tab-btn ${isSelected ? "selected" : ""}`}
                onClick={() => setActiveRoleIndex(idx)}
              >
                <Icon size={18} />
                <span>{role.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Role Showcase Card */}
        <div className="role-showcase-card">
          <div className="role-showcase-copy">
            <div className="role-showcase-header">
              <div className="role-icon-box">
                <ActiveRoleIcon size={26} />
              </div>
              <div>
                <span className="role-eyebrow">PORTAL OVERVIEW</span>
                <h3>{activeRole.title}</h3>
              </div>
            </div>
            <p className="role-desc">{activeRole.desc}</p>
            <ul className="role-points-list">
              {activeRole.points.map((pt) => (
                <li key={pt}>
                  <CheckCircle2 size={16} />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
            <div className="role-action-row">
              <Link to="/login" className="landing-btn landing-btn-solid">
                Sign in to {activeRole.name} <ArrowRight size={15} />
              </Link>
              <Link to="/register" className="landing-btn landing-btn-ghost">
                Register as Student
              </Link>
            </div>
          </div>

          <div className="role-showcase-visual">
            <div className="role-visual-inner">
              <div className="role-visual-chip">
                <span className="role-chip-dot" /> Live Portal Sandbox
              </div>
              <div className="role-mockup-card">
                <strong>{activeRole.name} Dashboard</strong>
                <p>Authenticated session: active</p>
                <div className="role-mock-lines">
                  <div className="mock-line" style={{ width: "85%" }} />
                  <div className="mock-line" style={{ width: "65%" }} />
                  <div className="mock-line" style={{ width: "90%" }} />
                </div>
                <div className="mock-badge-row">
                  <span className="pill pill-green">Connected</span>
                  <span className="pill pill-gray">IIIT-BH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Voices / Testimonials */}
      <section className="landing-section testimonials-section">
        <div className="landing-section-head">
          <span className="landing-eyebrow">Student Experiences</span>
          <h2>Feedback From IIIT Bhubaneswar Residents</h2>
          <p>Read how the central mess management platform has improved daily dining on campus.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={15} fill="#c5a059" color="#c5a059" />
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {t.name.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="landing-section faq-section">
        <div className="landing-section-head" style={{ textAlign: "center", margin: "0 auto 40px" }}>
          <span className="landing-eyebrow">Common Queries</span>
          <h2>Frequently Asked Questions</h2>
          <p style={{ maxWidth: 600, margin: "0 auto" }}>
            Everything you need to know about dining policies, QR check-ins, leaves, and billing.
          </p>
        </div>

        <div className="faq-accordion">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className={`faq-item ${isOpen ? "open" : ""}`}
              >
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className="faq-chevron"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease"
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Call To Action */}
      <section className="landing-cta-v2">
        <div className="landing-cta-v2-box">
          <span className="landing-eyebrow cta-eyebrow">
            JOIN IIIT BHUBANESWAR MESS
          </span>
          <h2>Ready To Experience Smarter Dining?</h2>
          <p>
            Skip the physical token line. View today's chef-prepared menu, generate your secure QR pass,
            and monitor your bills in real time.
          </p>
          <div className="cta-actions-row">
            <Link to="/register" className="landing-btn landing-btn-solid landing-btn-lg">
              Create Student Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="landing-btn landing-btn-ghost landing-btn-lg">
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="landing-footer-v2">
        <div className="landing-footer-top">
          <div className="footer-brand-col">
            <div className="landing-brand">
              <img src="/favicon.svg" alt="IIIT Logo" width="28" height="28" />
              <div className="landing-brand-text">
                <strong>IIIT BHUBANESWAR</strong>
                <span>CENTRAL MESS PORTAL</span>
              </div>
            </div>
            <p className="footer-tagline">
              Official Mess Management System. Smarter campus dining, contactless counter passes,
              transparent ledgers, and institutional food sustainability.
            </p>
            <div className="footer-badge-pill">
              <ShieldCheck size={14} /> Official IIIT-BH System
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Quick Navigation</h4>
            <a href="#schedule">Meal Schedule</a>
            <a href="#features">Capabilities</a>
            <a href="#how">How It Works</a>
            <a href="#roles">Role Portals</a>
            <a href="#faq">Campus FAQs</a>
          </div>

          <div className="footer-nav-col">
            <h4>User Portals</h4>
            <Link to="/login">Student Sign In</Link>
            <Link to="/register">Student Registration</Link>
            <Link to="/login">Mess Admin Portal</Link>
            <Link to="/login">Warden Portal</Link>
            <Link to="/login">Kitchen Counter Terminal</Link>
          </div>

          <div className="footer-nav-col">
            <h4>Institution & Support</h4>
            <span>International Institute of Information Technology</span>
            <span>Gothapatna, Malipada</span>
            <span>Bhubaneswar, Odisha 751003</span>
            <span style={{ marginTop: 8 }}>Email: mess@iiitbh.ac.in</span>
            <span>Contact: Hostel Office (P Block & Old Hostel)</span>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div className="footer-bottom-inner">
            <span>&copy; {new Date().getFullYear()} IIIT Bhubaneswar. Central Mess Management Portal. All rights reserved.</span>
            <div className="footer-bottom-links">
              <span>Hostel Dining Division</span>
              <span>&bull;</span>
              <span>High-Contrast White Edition</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
