import LegalPage, { LegalSection, LegalList } from '../components/LegalPage'
import { legal } from '../content/legal'

const Privacy = () => (
  <LegalPage
    title="Privacy policy"
    updated={legal.lastUpdated}
    intro={`This policy explains what personal information CarRentalX collects, why, and what you can do about it. CarRentalX is operated by ${legal.operatorName}.`}
  >
    <LegalSection title="What we collect">
      <LegalList
        items={[
          'Account details: your name, email address and password. The password is stored only as a hash, so we cannot read it.',
          'Optional profile photo and driving licence image, if you upload them to your profile.',
          'Booking details: the car, rental dates, booking type, price and status of each request.',
          'Notifications created about your bookings, such as approvals and rejections.',
          'Your IP address, which the server uses briefly to limit repeated requests and protect sign-in from abuse.',
        ]}
      />
    </LegalSection>

    <LegalSection title="Why we use it">
      <LegalList
        items={[
          'To create and manage your account and keep you signed in.',
          'To receive, price and review your booking requests, and to tell you the result.',
          'To check that a driving licence is on file for self-drive bookings.',
          'To keep the service secure and prevent misuse.',
        ]}
      />
      {legal.sendsEmail && <p>We also email you about the status of your bookings.</p>}
      <p>We do not sell your personal information, and we do not use it for advertising.</p>
    </LegalSection>

    <LegalSection title="Who can see it">
      <p>
        Administrators of CarRentalX can see your account details and your bookings so they can review requests.
        Hosting and database providers process data on our behalf in order to run the service. We share information
        with others only if the law requires it.
      </p>
    </LegalSection>

    <LegalSection title="Browser storage">
      <p>
        We store a sign-in token and any cars you save as favourites in your browser&apos;s local storage on your
        device. We do not use advertising or tracking cookies. Signing out removes the sign-in token.
      </p>
    </LegalSection>

    <LegalSection title="How long we keep it">
      <p>
        We keep your account and booking records for as long as your account exists, unless you ask us to delete
        them. Your driving licence image is kept {legal.licenceRetention}.
      </p>
    </LegalSection>

    <LegalSection title="Security">
      <p>
        Passwords are stored as hashes, access to your data requires signing in, and the service is served over
        HTTPS. No system is perfectly secure, so we cannot guarantee absolute security.
      </p>
    </LegalSection>

    <LegalSection title="Your choices">
      <p>
        You can update your profile details and images from your profile page. To ask for a copy of your data,
        a correction, or deletion of your account and data, email us at {legal.contactEmail}. If you are in India,
        the Digital Personal Data Protection Act, 2023 may give you additional rights over your personal data.
      </p>
    </LegalSection>

    <LegalSection title="Age">
      <p>CarRentalX is for people aged 18 or over. We do not knowingly collect information from anyone younger.</p>
    </LegalSection>

    <LegalSection title="Changes and contact">
      <p>
        If we change this policy, we will update the date at the top of this page. Questions about privacy can be
        sent to {legal.contactEmail}.
      </p>
    </LegalSection>
  </LegalPage>
)

export default Privacy