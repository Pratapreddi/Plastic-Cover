# Plastic Cover — setup and deployment

This is a React + TypeScript + Vite storefront with Firebase Authentication, Cloud Firestore and Firebase Storage integration, plus WhatsApp click-to-chat.

## 1. Install and run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

The storefront includes a small demo catalogue before Firebase is configured. Admin login, persistent product CRUD and image uploads require a Firebase project.

## 2. Create Firebase project

1. Open https://console.firebase.google.com/ and create a project named Plastic Cover.
2. Add a Web App and copy its Firebase configuration into `.env`.
3. In Authentication → Sign-in method, enable **Email/Password**.
4. In Authentication → Users, add your own admin email and password. Do not put public admin credentials in source code.
5. Create a Cloud Firestore database.
6. Enable Firebase Storage.
7. The `.env.example` already contains `VITE_WHATSAPP_NUMBER=918105628853` for the supplied number. Keep the country code and digits only.

Restart the dev server after editing `.env`.

## 3. Firestore security rules

Publish rules like these. The admin role is controlled by a Firebase custom claim named `admin`; a normal signed-in user is not automatically an administrator.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
    match /products/{productId} {
      allow read: if resource.data.active == true || isAdmin();
      allow create, update, delete: if isAdmin();
    }
  }
}
```

For a new product, the rule above permits public reads of existing active products; product writes require an admin custom claim. Assign the claim securely using the Firebase Admin SDK in a trusted server environment, never from browser code. Example server-side Admin SDK operation:

```javascript
await getAuth().setCustomUserClaims(uid, { admin: true });
```

## 4. Firebase Storage rules

Publish rules like these. They allow public read access to product images and admin-only uploads/deletes:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }
    match /products/{fileName} {
      allow read: if true;
      allow write: if isAdmin()
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
  }
}
```

## 5. Build and deploy

```bash
npm run build
```

Deploy the `dist` folder to Vercel or another static host. Add the same `VITE_...` environment variables in the hosting provider's project settings. Configure SPA fallback/rewrites so client routes resolve to `index.html` if routes are added later.

## 6. WhatsApp ordering

The Buy Now button opens WhatsApp at `+91 81056 28853` with product name, price and available product specifications pre-filled. The customer sends the message manually. No online payment or automated order confirmation is implemented.

## Important production notes

- Set a real WhatsApp number before launch.
- The demo product images are placeholders; replace them with your own transparent packing material photos and enter your actual prices, lengths, widths, thicknesses and weights.
- This starter uses Firebase custom claims for admin authorization. You must assign the `admin: true` claim from a trusted server using the Firebase Admin SDK before the account can manage products.
- Add privacy policy, terms, delivery/returns details and business contact information before accepting public traffic.
- Do not commit `.env` or service-account credentials. The Firebase web config is designed for client use; Firestore and Storage security rules enforce access.
