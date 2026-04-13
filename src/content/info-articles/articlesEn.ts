import type { InfoArticle } from "./types";

/** English help & safety articles (parallel structure to RO). */
export const ARTICLES_EN: Record<string, InfoArticle> = {
  "cum-functioneaza": {
    slug: "cum-functioneaza",
    category: "ajutor",
    metaTitle: "How VEX works — full guide",
    metaDescription:
      "Learn how VEX works: search, publish listings, contact sellers, and manage your account.",
    title: "How the platform works",
    intro:
      "VEX is an online marketplace where individuals and businesses can post listings and connect directly with buyers. The focus is on simplicity: find what you need quickly, contact the seller through the channel provided, and manage your activity from your account.",
    sections: [
      {
        heading: "What you can do on VEX",
        paragraphs: [
          "As a visitor or signed-in user you can browse categories, filter by location, price, condition, and open listings that interest you. Each listing shows the essentials: description, photos where available, price, and contact details or a message button, depending on the seller’s settings.",
          "With an account you can save listings, publish your own offers, and receive messages from interested buyers. Your account centralises active listings, history, and notification settings so you control how you are contacted.",
        ],
        bullets: [
          "Search and filter across categories",
          "View listing details and photos",
          "Contact the seller (per platform rules)",
          "Publish and manage listings from your account",
        ],
      },
      {
        heading: "Finding what you need faster",
        paragraphs: [
          "Start with the right category or use search with specific keywords (model, size, year). Combine filters to narrow results—for example price range and city help you see only realistic offers.",
          "Read the description carefully and check that condition, warranty, and handover method are clear. If something is missing, ask the seller before you travel or pay.",
        ],
      },
      {
        heading: "What the platform does—and does not do",
        paragraphs: [
          "VEX helps users find each other and displays listings according to site policies. The actual transaction (payment, handover, warranty) happens between buyer and seller outside the platform, so you should follow recommended safety rules and verify both the person and the item before paying.",
          "The team may moderate reported or rule-breaking listings but cannot replace your own duty to verify an offer. Report suspicious listings to protect others.",
        ],
      },
      {
        heading: "Your account and preferences",
        paragraphs: [
          "After sign-up you can update profile data, password, and communication preferences. Use an active email and, where available, turn on notifications for new messages or listing changes.",
          "If your phone number or area changes, update them so buyers can reach you correctly.",
        ],
      },
      {
        heading: "More help",
        paragraphs: [
          "For concrete steps on publishing, contacting a seller, or account settings, see the dedicated Help articles. For fraud risk, read the Safety section and report any listing that looks deceptive.",
        ],
      },
    ],
  },

  "cum-publici-anunt": {
    slug: "cum-publici-anunt",
    category: "ajutor",
    metaTitle: "How to post a listing on VEX",
    metaDescription:
      "Step by step: create a clear listing, add photos, set a price, and manage your offer on VEX.",
    title: "How to post a listing",
    intro:
      "A well-structured listing sells faster and attracts better questions. Below are practical steps to publish a complete, policy-compliant offer.",
    sections: [
      {
        heading: "Before you publish",
        paragraphs: [
          "Write down the real characteristics of the product or service: condition (new, used, minor defects), included accessories, remaining warranty, invoice or documents. Take photos in good light from several angles, including any flaws—transparency reduces disputes later.",
          "Set a realistic price by comparing similar listings and factoring in wear and season. If you are open to negotiation, say so in the description.",
        ],
        bullets: [
          "Honest description of condition and accessories",
          "Clear, relevant photos without misleading filters",
          "Price and optional negotiation note",
        ],
      },
      {
        heading: "Creating the listing",
        paragraphs: [
          "Sign in and open the publish flow. Pick the correct category—wrong placement hurts discovery and may get the listing rejected. The title should state product type and key details (size, model, capacity).",
          "In the description, use short paragraphs or bullet lists for specs. Avoid excessive caps or vague claims. State handover terms: pickup, local delivery, courier—and who pays shipping.",
        ],
      },
      {
        heading: "Photos and contact options",
        paragraphs: [
          "Upload images within the size limits shown on the site. The first image is often the thumbnail in search—pick the most representative one. Do not use stock photos unless they exactly match what you sell.",
          "Check which contact details are public (phone, messaging) and set preferences before publishing.",
        ],
      },
      {
        heading: "After publishing: moderation and edits",
        paragraphs: [
          "Listings may be checked automatically or manually for banned content, duplicates, or wrong categories. If you are asked to edit, update text or images as instructed to avoid deactivation.",
          "Edit when the price or item changes—keep the description aligned with reality to maintain buyer trust.",
        ],
      },
      {
        heading: "Visibility best practices",
        paragraphs: [
          "Reply promptly to messages and mark the listing as sold when done to avoid pointless contacts. Renew only if rules allow—do not spam duplicates across categories.",
        ],
      },
    ],
  },

  "cum-contactezi-vanzatorul": {
    slug: "cum-contactezi-vanzatorul",
    category: "ajutor",
    metaTitle: "How to contact a seller on VEX",
    metaDescription:
      "First messages, questions to ask, polite negotiation, and avoiding misunderstandings.",
    title: "How to contact a seller",
    intro:
      "First impressions matter. A clear, respectful message improves your chances of useful answers and a smooth handover.",
    sections: [
      {
        heading: "What to include in the first message",
        paragraphs: [
          "Briefly introduce yourself and reference the listing (title or link). Ask about availability, condition, and whether you can inspect in person. If you negotiate, suggest a realistic range—avoid aggressive pressure.",
          "Avoid copy-paste spam to many sellers; those messages are often ignored.",
        ],
        bullets: [
          "Confirm the listing is still available",
          "Ask about defects or accessories",
          "Suggest a time window and a safe public place to meet",
        ],
      },
      {
        heading: "Communication channels",
        paragraphs: [
          "Use the platform’s messaging or contact button where provided. If a phone number is shown, call at reasonable hours and summarise agreements in writing after you agree on price and place—this reduces misunderstandings.",
          "Do not move to random apps immediately if the account looks suspicious or you are asked for upfront payment without justification.",
        ],
      },
      {
        heading: "Negotiation and healthy boundaries",
        paragraphs: [
          "Negotiation is normal—stay professional and accept a polite “no” if the price is firm. Do not tie viewing to advance payment; for second-hand goods, physical inspection matters when possible.",
        ],
      },
      {
        heading: "Meeting for handover",
        paragraphs: [
          "Agree on time and place in advance. Prefer well-lit public places for small items; for bulky goods or vehicles, verify identity and documents on site. Do not go alone to isolated locations with strangers.",
          "If the seller keeps postponing or changes terms abruptly, reconsider and read the scam recognition guide.",
        ],
      },
      {
        heading: "When something feels wrong",
        paragraphs: [
          "Stop if you are asked for SMS codes, unusual payment routes, or transfers to third parties. Report the listing and keep screenshots if you may need evidence later.",
        ],
      },
    ],
  },

  "gestioneaza-contul": {
    slug: "gestioneaza-contul",
    category: "ajutor",
    metaTitle: "Managing your VEX account",
    metaDescription:
      "Account settings, security, listings, personal data, and notifications on VEX.",
    title: "How to manage your account",
    intro:
      "Your account is the control centre for listings, messages, and preferences. Good configuration saves time and reduces unauthorised access risk.",
    sections: [
      {
        heading: "Profile and sign-in",
        paragraphs: [
          "Keep your email and phone up to date—they are used for recovery and important alerts. Use a long, unique password for this site and do not reuse it elsewhere.",
          "If two-factor authentication or extra checks are available, enable them.",
        ],
        bullets: [
          "Unique password; change it if you suspect compromise",
          "Valid email for resets and alerts",
          "Sign out on shared devices",
        ],
      },
      {
        heading: "Your listings",
        paragraphs: [
          "From the dashboard you can see active, expired, or moderated listings. Edit text or images when the item changes and close the listing after sale to stop irrelevant enquiries.",
          "Respect anti-duplicate rules—do not repost the same item across many categories with different titles.",
        ],
      },
      {
        heading: "Messages and notifications",
        paragraphs: [
          "Configure which notifications you receive (email, push). Turn off noise, but keep security-related alerts.",
        ],
      },
      {
        heading: "Privacy and visibility",
        paragraphs: [
          "Review what is public on your profile and in listings. Avoid putting sensitive personal data in public descriptions. If you shared data by mistake, delete it from chats and contact support where erasure rights apply.",
        ],
      },
      {
        heading: "Access issues and support",
        paragraphs: [
          "If you cannot sign in, use password reset and check spam folders. For suspicious activity, change your password immediately and contact support with details.",
        ],
      },
    ],
  },

  "intrebari-frecvente": {
    slug: "intrebari-frecvente",
    category: "ajutor",
    metaTitle: "Frequently asked questions — VEX",
    metaDescription:
      "Common questions about accounts, listings, payments, and safety on VEX.",
    title: "Frequently asked questions",
    intro:
      "Answers to common questions below. If you need more, browse Help and Safety or contact official support.",
    sections: [
      {
        heading: "Account and registration",
        paragraphs: [
          "Posting listings and managing messages requires a valid account. Use an email you can access—you will receive confirmations and security alerts. One account per person is enough; multiple accounts to bypass limits may lead to suspension.",
        ],
        bullets: [
          "How do I reset my password? — Use the reset option on the sign-in page.",
          "Can I change my email? — Yes, in account settings after confirming the new address.",
        ],
      },
      {
        heading: "Publishing and fees",
        paragraphs: [
          "Check the site for free options or paid promotion (highlighting, bumps). Policies may change—read pricing or service FAQs before paying.",
          "Promotion does not guarantee a sale; description quality and fair pricing still matter most.",
        ],
      },
      {
        heading: "Payments and transactions",
        paragraphs: [
          "Often the platform only connects parties; payment is between you directly. Do not send money to unverified people or accept unofficial “guarantees.” For expensive items, prefer inspection on site or payment methods with protections where applicable.",
        ],
      },
      {
        heading: "Moderation and rejected listings",
        paragraphs: [
          "A listing may be rejected for wrong category, banned content, or inappropriate images. Read the rejection message, fix the issue, and resubmit. If you believe it was an error, follow the appeal path from support.",
        ],
      },
      {
        heading: "Safety and reporting",
        paragraphs: [
          "Report phishing, absurdly low prices, or advance payment for unseen goods. Never share SMS codes or bank details with “buyers” who have not inspected the item.",
        ],
      },
      {
        heading: "Personal data and account deletion",
        paragraphs: [
          "You may request updates or deletion under the privacy policy and applicable law. Deleting an account may remove listing history and messages—confirm before proceeding if you need records for disputes.",
        ],
      },
    ],
  },

  "sfaturi-anti-frauda": {
    slug: "sfaturi-anti-frauda",
    category: "siguranta",
    metaTitle: "Anti-fraud tips — VEX",
    metaDescription:
      "Protect yourself when buying and selling online: payments, verification, personal data, and red flags.",
    title: "Anti-fraud tips",
    intro:
      "Scammers exploit urgency, misplaced trust, and skipped checks. A few simple rules greatly reduce the risk of losing money or data.",
    sections: [
      {
        heading: "Verify in two steps",
        paragraphs: [
          "Before paying, verify the person and that the item exists. Before handing over goods or cash, verify that payment is real and not a fake receipt or reversible transfer.",
          "Do not rely only on screenshots—they can be faked. Prefer public meetings and identity checks for higher-value deals.",
        ],
      },
      {
        heading: "Payments and transfers",
        paragraphs: [
          "Be wary of upfront payment before you see the item, especially via irreversible methods to unknown individuals (bank transfer to random accounts, gift cards, crypto to anonymous addresses).",
          "Buyer-protection methods (where they exist and fit your case) are preferable for large amounts. “Pay now or lose it” pressure is a red flag.",
        ],
        bullets: [
          "Avoid paying “shipping agents” or third-party accounts",
          "Never send SMS codes or passwords",
          "Confirm the IBAN matches a verified seller",
        ],
      },
      {
        heading: "Personal data and phishing",
        paragraphs: [
          "Do not enter credentials on sites that imitate VEX. Check the browser domain and use official links. Banks and platforms never ask for your full password or codes in chat.",
          "Suspicious “account suspended” emails with urgent links—open the site by typing the URL or from your bookmarks, not from the email.",
        ],
      },
      {
        heading: "Too good to be true",
        paragraphs: [
          "Prices far below market, the same photo in many listings, or refusal to meet for inspection are strong warning signs. Try reverse image search and compare descriptions elsewhere.",
        ],
      },
      {
        heading: "If you are targeted",
        paragraphs: [
          "Stop any payment in progress if possible, notify your bank, and report to authorities where appropriate. Report the listing and user on VEX and keep chat evidence.",
        ],
      },
    ],
  },

  "cum-recunosti-un-scam": {
    slug: "cum-recunosti-un-scam",
    category: "siguranta",
    metaTitle: "How to spot an online scam",
    metaDescription:
      "Typical scam patterns in classifieds: pressure, odd payments, fake identities, and how to react.",
    title: "How to recognise a scam",
    intro:
      "Scammers repeat the same patterns. Learn the signs before you lose money or expose sensitive data.",
    sections: [
      {
        heading: "Emotional pressure and fake urgency",
        paragraphs: [
          "Messages claiming “others are waiting,” that you must pay in minutes, or that the deal ends today are designed to bypass critical thinking. Financial decisions should not be made under pressure.",
        ],
      },
      {
        heading: "Refusal to meet in person",
        paragraphs: [
          "For local goods, serious sellers usually allow inspection. Repeated excuses, only courier delivery from dubious firms, or payment before any real proof should be treated sceptically.",
        ],
        bullets: [
          "“Send a deposit and I ship tomorrow” without solid proof",
          "Refusal of a quick call or video for small items when distance allows",
        ],
      },
      {
        heading: "Unusual payment methods",
        paragraphs: [
          "Anonymous wallets, gift-card-only payments, phone top-ups, or “registration fees” to receive a parcel are common tricks. Legitimate deals usually use normal, verifiable methods.",
        ],
      },
      {
        heading: "Fake identities and documents",
        paragraphs: [
          "New profiles with no history, generic photos, or duplicate photos across unrelated listings deserve extra checks. Ask specific questions about the item (serial number, small defect)—a real seller knows.",
        ],
      },
      {
        heading: "Phishing and external links",
        paragraphs: [
          "If you are pushed fast to other chats with promises of “protected” payment by unknown services, stop. Verify that service independently of the seller’s message.",
        ],
      },
      {
        heading: "What to do if you suspect a scam",
        paragraphs: [
          "Do not pay, do not send ID photos with full personal numbers visible, report the user and listing. Warn others via platform reporting if available.",
        ],
      },
    ],
  },

  "reguli-siguranta-cumparare": {
    slug: "reguli-siguranta-cumparare",
    category: "siguranta",
    metaTitle: "Safety rules for buyers",
    metaDescription:
      "Buyer checklist: verify the product, meeting place, safe payment, and avoiding fraud.",
    title: "Safety rules when buying",
    intro:
      "Buyers can control many risks with simple checks before and during the deal. Follow the rules below for safer experiences.",
    sections: [
      {
        heading: "Before you go to a meeting",
        paragraphs: [
          "Read the full listing and ask pointed questions: warranty, invoice, real mileage, testing on site. If answers are evasive, reconsider.",
        ],
        bullets: [
          "Compare the price to the market; large gaps need an explanation",
          "Ask for extra photos if something does not match",
        ],
      },
      {
        heading: "Where to meet",
        paragraphs: [
          "Prefer busy public places in daylight. For phones or electronics, test functions in front of the seller. Do not follow strangers to private spaces on first meeting.",
        ],
      },
      {
        heading: "Payment",
        paragraphs: [
          "Avoid carrying huge cash in unsafe places; for large sums ask your bank about safer options. Do not pay in full upfront without control of the item or a contract where required (vehicles, property).",
        ],
      },
      {
        heading: "Documents and warranty",
        paragraphs: [
          "For vehicles or electronics, check serial numbers, block status, and ownership papers. For warrantied goods, ask for proof of original purchase.",
        ],
      },
      {
        heading: "After purchase",
        paragraphs: [
          "Change passwords on second-hand devices, factory-reset where appropriate, and check for hidden obligations (loans, leasing).",
        ],
      },
    ],
  },

  "reguli-siguranta-vanzare": {
    slug: "reguli-siguranta-vanzare",
    category: "siguranta",
    metaTitle: "Safety rules for sellers",
    metaDescription:
      "Sell safely: vet buyers, handover, payment verification, and avoiding scams.",
    title: "Safety rules when selling",
    intro:
      "Sellers are targets for fake payments or buyers trying to obtain goods without real payment. Here is how to protect yourself.",
    sections: [
      {
        heading: "Filtering contacts",
        paragraphs: [
          "Reply to people who ask concrete questions. Ignore generic messages that immediately ask to move to other apps without context. Never send “verification codes” to “couriers.”",
        ],
      },
      {
        heading: "Verifying payment",
        paragraphs: [
          "For bank transfers, confirm in your banking app that funds are cleared and available—not just a promise. Watch for fake payment emails.",
        ],
        bullets: [
          "Do not hand over goods based on a screenshot alone",
          "For cash, count notes in a safe setting",
        ],
      },
      {
        heading: "Handover",
        paragraphs: [
          "Public places for small items; for bulky goods home viewing may be needed—assess risk and avoid being alone if possible.",
        ],
      },
      {
        heading: "Avoiding “overpayment” scams",
        paragraphs: [
          "Classic pattern: buyer “sends too much” and asks you to refund the difference. The initial transfer may be fraudulent or reversible. Do not refund anything until you are certain funds are real and available.",
        ],
      },
      {
        heading: "Personal data",
        paragraphs: [
          "Do not send uncensored ID copies in public chat. If a contract needs ID, share only what is legally necessary through safer channels.",
        ],
      },
    ],
  },

  "raporteaza-anunt": {
    slug: "raporteaza-anunt",
    category: "siguranta",
    metaTitle: "Report a suspicious listing — VEX",
    metaDescription:
      "How and when to report a listing: reasons, evidence, what happens next, and helping the community.",
    title: "Report a suspicious listing",
    intro:
      "Reports help keep the marketplace clean. Use reporting when you see rule violations or dangerous behaviour.",
    sections: [
      {
        heading: "When to report",
        paragraphs: [
          "Report banned products, offensive content, abusive duplicates, bait prices, or fraudulent payment requests. Each serious report helps moderators act faster.",
        ],
        bullets: [
          "Misleading listings or stolen identities",
          "Harassment or discrimination in text or images",
          "Spam or phishing disguised as an offer",
        ],
      },
      {
        heading: "How to report",
        paragraphs: [
          "Open the listing page and use the report option shown on the site. Pick the closest reason and briefly describe what is wrong or why you believe it is fraudulent.",
        ],
      },
      {
        heading: "What to include",
        paragraphs: [
          "Mention if you were asked for advance payment, if the photo looks stolen, or if the user refused verification. Follow platform instructions for attachments—avoid oversharing your own sensitive data.",
        ],
      },
      {
        heading: "After you report",
        paragraphs: [
          "Moderators may temporarily hide the listing, ask the seller for clarification, or close accounts in severe cases. You may not always get an individual reply due to volume, but the report is logged.",
        ],
      },
      {
        heading: "Limits and abuse of reporting",
        paragraphs: [
          "Do not use reports to attack competitors or for subjective grudges without basis. Repeated false reports may affect your own account.",
        ],
      },
      {
        heading: "Serious incidents",
        paragraphs: [
          "If you were the victim of a crime (fraud), contact the competent authorities and preserve all evidence. Platform reporting does not replace a police report where needed.",
        ],
      },
    ],
  },
};
