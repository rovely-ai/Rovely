/**
 * Import function triggers from their respective submodules
 */

 const functions = require("firebase-functions");
 const admin = require("firebase-admin");

 admin.initializeApp();

 const db = admin.firestore();

 /**
  * Invite Preview Function
  * Generates:
  * - Open Graph metadata
  * - Dynamic invite landing page
  * - App deep linking
  */

 exports.invitePreview = functions.https.onRequest(async (req, res) => {

     const tripId = req.query.tripId || "";
     const inviteCode = req.query.code || "";

     // Default fallback values
     let title =
         "You're invited to a trip on Rovely!";

     let description =
         "Tap to view and accept your trip invite.";

     let imageUrl =
         "https://rovelyai.com/assets/og-default.png";

     const appUrl =
         `https://rovelyai.com/invite?tripId=${tripId}&code=${inviteCode}`;

     // Dynamic page values
     let tripName = "Your Trip";
     let destinationText = "";
     let durationText = "";
     let countdownText = "";
     let inviteSubText = "Someone invited you to join their trip on Rovely AI";

     /**
      * Fetch Trip
      */

     if (tripId) {

         try {

             const tripDoc = await db
                 .collection("trips")
                 .doc(tripId)
                 .get();

             if (tripDoc.exists) {

                 const trip = tripDoc.data();

                 tripName =
                     trip.itinerary_name ||
                     "A Trip on Rovely";

                 const authorId = trip.authorId || "";

                 destinationText =
                     trip.destinations_list || "";

                 const startDate =
                     trip.travel_start_date;

                 const endDate =
                     trip.travel_end_date;

                 imageUrl =
                     trip.image_url || imageUrl;

                 title =
                     `You're invited: ${tripName}`;

                 if (authorId) {
                     const authorName = await getAuthorDisplayName(authorId);
                     if (authorName) {
                         inviteSubText = `${authorName} invited you to join their trip on Rovely AI`;
                     }
                 }

                 // Description

                 const parts = [];

                 if (destinationText) {
                     parts.push(destinationText);
                 }

                 parts.push(
                     "Tap to view and accept your invite on Rovely."
                 );

                 description =
                     parts.join(" · ");

                 /**
                  * Duration + Countdown
                  */

                 if (startDate && endDate) {

                     const today = new Date();

                     const start =
                         startDate.toDate
                             ? startDate.toDate()
                             : new Date(startDate);

                     const end =
                         endDate.toDate
                             ? endDate.toDate()
                             : new Date(endDate);

                     const durationDays = Math.ceil(
                         (end - start) /
                         (1000 * 60 * 60 * 24)
                     );

                     if (!isNaN(durationDays)) {

                         durationText =
                             durationDays + " Days";

                     }

                     const countdownDays = Math.ceil(
                         (start - today) /
                         (1000 * 60 * 60 * 24)
                     );

                     if (!isNaN(countdownDays)) {

                         if (countdownDays > 0) {

                             countdownText =
                                 countdownDays +
                                 " days to go";

                         } else {

                             countdownText =
                                 "Trip is underway";

                         }

                     }

                 }

                 console.log(
                     `✅ Trip fetched: ${tripName}`
                 );

             } else {

                 console.log(
                     `⚠️ Trip not found: ${tripId}`
                 );

             }

         } catch (error) {

             console.error(
                 `❌ Error fetching trip:`,
                 error
             );

         }

     }

     /**
      * Cache
      */

     res.set(
         "Cache-Control",
         "public, max-age=300, s-maxage=600"
     );

     /**
      * HTML Response
      */

     res.send(`
 <!DOCTYPE html>
 <html lang="en">
 
 <head>
 
     <meta charset="UTF-8">
 
     <meta
         name="viewport"
         content="width=device-width, initial-scale=1.0"
     >
 
     <title>${escapeHtml(title)}</title>
 
     <meta
         name="description"
         content="${escapeHtml(description)}"
     >
     <link rel="icon" type="image/png" href="https://rovelyai.com/Assets/favicon.ico">
 
     <meta property="og:type" content="website">
 
     <meta
         property="og:url"
         content="${escapeHtml(appUrl)}"
     >
 
     <meta
         property="og:title"
         content="${escapeHtml(title)}"
     >
 
     <meta
         property="og:description"
         content="${escapeHtml(description)}"
     >
 
     <meta
         property="og:image"
         content="${escapeHtml(imageUrl)}"
     >
 
     <meta property="og:image:width" content="1200">
 
     <meta property="og:image:height" content="630">
 
     <meta property="og:site_name" content="Rovely AI">
 
     <meta
         name="twitter:card"
         content="summary_large_image"
     >
 
     <meta
         name="twitter:title"
         content="${escapeHtml(title)}"
     >
 
     <meta
         name="twitter:description"
         content="${escapeHtml(description)}"
     >
 
     <meta
         name="twitter:image"
         content="${escapeHtml(imageUrl)}"
     >
 
     <meta
         name="apple-itunes-app"
         content="app-id=6762536395"
     >
 
     <link
         rel="preconnect"
         href="https://fonts.googleapis.com"
     >
 
     <link
         rel="preconnect"
         href="https://fonts.gstatic.com"
         crossorigin
     >
 
     <link
         href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
         rel="stylesheet"
     >
 
     <style>
 
         * {
             margin: 0;
             padding: 0;
             box-sizing: border-box;
         }

         body {
             font-family: 'Montserrat', sans-serif;
             background: #f4f4f4;
             min-height: 100vh;
             color: #1f1f1f;
         }

         .page {
             display: flex;
             justify-content: center;
             min-height: 100vh;
             background: #f4f4f4;
         }

         .mobile-shell {
            width: 100%;
            height: auto;
            background: white;
            position: relative;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
         }

         .hero {
             position: relative;
             height: 430px;
         }

         .hero-image {
             width: 100%;
             height: 100%;
             object-fit: cover;
             filter: brightness(0.65);
         }

         .hero-overlay {
             position: absolute;
             inset: 0;
         }

         .topbar {
             position: absolute;
             top: 0;
             left: 0;
             width: 100%;
             padding: 26px 24px;
             display: flex;
             justify-content: space-between;
             align-items: center;
             z-index: 3;
         }

         .brand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
         }

         .brand-logo {
            height: 28px !important; /* Forces the sizing layout constraint */
            width: auto !important;  /* Keeps the aspect ratio from stretching distorting */
            display: inline-block;
            object-fit: contain;
        }

         .invite-title {
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, -50%);
             width: 90%;
             text-align: center;
             z-index: 2;
             color: white;
             font-size: 32px;
             font-weight: 700;
             line-height: 1.2;
             text-shadow: 0 2px 10px rgba(0,0,0,0.3);
         }
 
         .trip-card {
             position: relative;
             margin: -300px 24px 0 24px;
             background: rgba(255,255,255,0.96);
             backdrop-filter: blur(18px);
             border-radius: 28px;
             padding: 30px 24px;
             z-index: 5;
             box-shadow: 0 12px 40px rgba(0,0,0,0.12);
         }
 
         .trip-name {
             text-align: center;
             font-size: 24px;
             font-weight: 700;
             line-height: 1.1;
             color: #404040;
             margin-bottom: 14px;
         }
 
         .invite-text {
             text-align: center;
             font-size: 16px;
             color: #444;
             line-height: 1.5;
             margin-bottom: 26px;
         }
 
         .section {
             border-top: 1px solid #e8e8e8;
             padding-top: 18px;
             margin-top: 18px;
         }
 
         .label {
             font-size: 14px;
             font-weight: 700;
             color: #666;
             letter-spacing: 0.4px;
             margin-bottom: 10px;
         }
 
         .value {
             font-size: 16px;
             line-height: 1.5;
             color: #1f1f1f;
         }
 
         .cta-section {
             text-align: center;
             padding: 40px 24px;
         }
 
         .cta-title {
            color: #E27606;
            font-size: 24px;
            font-weight: 600;
            line-height: 1.15;
            margin-bottom: 16px;
         }
 
         .cta-description {
             font-size: 16px;
             color: #404040;
             margin-bottom: 32px;
         }
 
         .button-section{
            display: flex;
            flex-direction:column;
            padding-bottom: 30px;
         }
 
         .app-store-btn img {
             height: 60px;
             transition: transform 0.2s ease;
         }
 
         .app-store-btn:hover img {
             transform: scale(1.02);
         }
 
         .open-app {
             margin-top: 20px;
             border: none;
             background: none;
             color: #177D83;
             font-size: 16px;
             cursor: pointer;
             text-decoration: underline;
         }
 
         .footer-space {
             height: 40px;
         }
 
         @media (min-width: 768px) {
            .page{
                align-items: flex-start;
                overflow-y: auto;
            }
            .mobile-shell {
                margin-bottom: 40px;
            }
        
            .hero {
                height: 440px;
            }
 
            .invite-title {
                font-size: 64px;
            }
        
            .trip-card {
                max-width: 640px;
                margin: -350px auto 0 auto;
                padding: 40px;
            }
        
            .trip-name {
                font-size: 52px;
            }
        
            .invite-text {
                font-size: 20px;
                max-width: 480px;
                margin-left: auto;
                margin-right: auto;
            }
        
            .cta-section {
                padding-top: 60px;
                padding-bottom: 60px;
            }
        
            .cta-title {
                font-size: 48px;
            }
        
            .cta-description {
                font-size: 20px;
            }
         }
 
     </style>
 
 </head>
 
 <body>
 
 <div class="page">
 
     <div class="mobile-shell">
 
         <div class="hero">
 
             ${
                 imageUrl
                     ? '<img src="' +
                       escapeHtml(imageUrl) +
                       '" alt="Trip cover" class ="hero-image">'
                     : '<div style="width:100%;height:100%;background:#ccc"></div>'
             }

             <div class="hero-overlay"></div>

             <div class="topbar">
                <div class="brand">
                    <img src="https://rovelyai.com/Assets/white-RovelyLogo.png" alt="Rovely AI Logo" class="brand-logo" >
                    <span>Rovely AI</span>
                </div>
            </div>
         </div> <div class="trip-card">

             <div class="trip-name">
                 ${escapeHtml(tripName)}
             </div>

             <div class="invite-text">
                 ${escapeHtml(inviteSubText)}
             </div>

             <div class="section">
                 <div class="label">DURATION</div>
                 <div class="value">
                     ${escapeHtml(durationText || "Trip details coming soon")}
                 </div>
             </div>

             <div class="section">
                 <div class="label">DESTINATIONS</div>
                 <div class="value">
                     ${escapeHtml(destinationText || "Destination details coming soon")}
                 </div>
             </div>

             <div class="section">
                 <div class="label">COUNTDOWN</div>
                 <div class="value">
                     ${escapeHtml(countdownText || "Adventure starts soon")}
                 </div>
             </div>

         </div> <div class="cta-section">

             <div class="cta-title">
                 Get the Rovely AI App
             </div>

             <div class="cta-description">
                 Experience the trip together.<br>
                 View itineraries, expenses,
                 and checklists.
             </div>

             <div class="button-section">
                 <a class="app-store-btn" href="https://apps.apple.com/us/app/rovely-ai/id6762536395">
                     <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store">
                 </a>

                 <button class="open-app" id="openAppBtn">
                     Already have the app? Open in Rovely
                 </button>
             </div>

         </div>

         <div class="footer-space"></div>

     </div>

 </div>

 <script>
     const tripId = ${JSON.stringify(tripId)};
     const inviteCode = ${JSON.stringify(inviteCode)};

     document
         .getElementById("openAppBtn")
         .addEventListener("click", () => {
             if (tripId && inviteCode) {
                 window.location.href =
                     "rovely://invite?tripId=" +
                     tripId +
                     "&code=" +
                     inviteCode;
             }
         });
 </script>

 </body>
 </html>
     `);

 });

 /**
  * Fetches an author's formatted name from the users collection
  */
 async function getAuthorDisplayName(authorId) {
     if (!authorId) return "";

     try {
         const userDoc = await db.collection("users").doc(authorId).get();

         if (userDoc.exists) {
             const userData = userDoc.data();
             const firstName = userData.firstName || "";
             const lastName = userData.lastName || "";

             if (firstName && lastName) {
                 const lastInitial = lastName.trim().charAt(0).toUpperCase();
                 return `${firstName.trim()} ${lastInitial}.`;
             } else if (firstName) {
                 return firstName.trim();
             }
         }
         return "";
     } catch (error) {
         console.error(`❌ Error fetching user data for ID ${authorId}:`, error);
         return "";
     }
 }

 /**
  * Escape HTML
  */
 function escapeHtml(text) {
     if (!text) return "";
     return String(text)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }