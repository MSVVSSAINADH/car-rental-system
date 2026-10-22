import { Link } from 'react-router-dom'
import LegalPage, { LegalSection, LegalList } from '../components/LegalPage'
import { legal } from '../content/legal'

const Terms = () => (
  <LegalPage
    title="Terms and conditions"
    updated={legal.lastUpdated}
    intro={`These terms apply when you use CarRentalX, operated by ${legal.operatorName}. By creating an account or sending a booking request, you agree to them.`}
  >
    <LegalSection title="About the service">
      <p>
        CarRentalX lets you browse cars and send a rental request. A request is not a confirmed booking. It becomes
        a booking only when an administrator approves it. The app does not take online payment, and sending a
        request does not charge you.
      </p>
    </LegalSection>

    <LegalSection title="Accounts and eligibility">
      <LegalList
        items={[
          'You must be at least 18 years old.',
          'You must give accurate information and keep it up to date.',
          'You are responsible for keeping your password private and for activity on your account.',
          'Self-drive bookings need a valid driving licence image on your profile.',
        ]}
      />
    </LegalSection>

    <LegalSection title="Booking requests and prices">
      <p>
        You choose a car, dates and a booking type. The server calculates the final price when you submit the
        request, and the price is shown in your booking. Prices are in Indian rupees per day.
      </p>
      <p>
        An administrator may approve or reject any request, for example because a car is unavailable. When a
        request is rejected you can send a new one. Availability is not guaranteed until a request is approved.
      </p>
    </LegalSection>

    <LegalSection title="Introductory offer">
      <p>
        New customers may receive a discount on their first bookings, as described on the home page. The server
        decides whether you are eligible when you submit a request, and the offer may change or end at any time.
      </p>
    </LegalSection>

    <LegalSection title="Your driving licence">
      <p>
        The licence image you upload must be your own and clearly readable. We may reject a request if the image
        is missing, unclear or does not match your account.
      </p>
    </LegalSection>

    <LegalSection title="Acceptable use">
      <LegalList
        items={[
          'Do not use the service for anything unlawful.',
            "Do not share your account or use someone else's details.",
          'Do not try to break, overload or gain unauthorised access to the service.',
        ]}
      />
    </LegalSection>

    {legal.rentalConditions.length > 0 && (
      <LegalSection title="Rental conditions">
        <LegalList items={legal.rentalConditions} />
      </LegalSection>
    )}

    <LegalSection title="Suspending accounts">
      <p>
        We may block or close an account that breaks these terms or is used to misuse the service. You can ask us
        to close your account at any time.
      </p>
    </LegalSection>

    <LegalSection title="Availability and liability">
      <p>
        We work to keep the service running, but we do not promise it will always be available or free of errors.
        To the extent the law allows, we are not liable for indirect or consequential loss arising from your use
        of the service. Nothing in these terms limits any liability that cannot be limited by law.
      </p>
    </LegalSection>

    <LegalSection title="Governing law">
      <p>
        These terms are governed by the laws of India. Disputes are subject to the courts at {legal.jurisdictionCity}.
      </p>
    </LegalSection>

    <LegalSection title="Changes and contact">
      <p>
        If we change these terms, we will update the date at the top of this page. Questions can be sent to{' '}
        {legal.contactEmail}. See also our{' '}
        <Link to="/privacy" className="font-medium text-primary hover:underline">
          privacy policy
        </Link>
        .
      </p>
    </LegalSection>
  </LegalPage>
)

export default Terms