import { useNavigate, Link } from "react-router-dom";
import logo from "../images/bookington-logo.png";
import djDashboard from "../images/dj-dashboard.png";
import promoterDashboard from "../images/promoter-dashboard.png";
import eventDetail from "../images/event-detail.png";
import djSearch from "../images/dj-search.png";
import djProfileEdit from "../images/dj-profile-edit.png";
import availabilityWeekly from "../images/availability-weekly.png";
import availabilityCustom from "../images/availability-custom.png";

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-black to-gray-800 text-white px-6 py-12 space-y-12">
      <img src={logo} alt="Bookington Logo" className="w-64 md:w-80 h-auto mb-10 md:mb-14 drop-shadow-lg" />
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-5xl font-bold">Book DJs. Get Booked. All in One Place.</h1>
        <p className="text-lg text-gray-300">
          Promoters can easily discover and book DJs for their events, while DJs can showcase their profiles and get booked by promoters — all on one streamlined platform.
        </p>
        <button onClick={() => navigate('/signup')} className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white font-semibold transition">Sign Up Now</button>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 text-center">
        {/* DJs Column */}
        <div className="flex-1 bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">For DJs</h2>
          <p className="text-gray-300 mb-6">
            Create a detailed profile with your bio, genres, cities you play in, availability, and links to your social media. Promoters can easily discover and book you without endless back-and-forth.
          </p>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col items-center">
              <img src={djDashboard} alt="DJ Dashboard" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                DJ Dashboard – View and manage booking requests, upcoming events, and your profile all in one place.
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img src={djProfileEdit} alt="DJ Profile Edit" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                DJ Profile Setup – Add your bio, genres, cities, availability, and links so promoters can discover and book you easily.
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img src={availabilityWeekly} alt="Weekly Availability" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                Weekly Availability – Select the days of the week you’re usually available to perform.
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img src={availabilityCustom} alt="Custom Dates" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                Custom Dates – Add or block off specific dates to fine-tune your availability.
              </span>
            </div>
          </div>
        </div>

        {/* Promoters Column */}
        <div className="flex-1 bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">For Promoters</h2>
          <p className="text-gray-300 mb-6">
            Search DJs by genre, city, and availability. Review their profiles, bios, and social media before sending booking requests — all in one place.
          </p>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col items-center">
              <img src={promoterDashboard} alt="Promoter Dashboard" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                Promoter Dashboard – Promoters can track booking requests they've sent and manage their upcoming events.
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img src={eventDetail} alt="Event Detail" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                Event Details – Promoters can view and edit event information, see which DJs are booked, and manage pending requests.
              </span>
            </div>
            <div className="flex flex-col items-center">
              <img src={djSearch} alt="DJ Search" className="rounded-lg shadow-lg w-full" />
              <span className="mt-2 text-sm text-gray-300">
                Find DJs – Promoters can search and filter DJs by genre, city, and availability before sending a booking request.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">How do I sign up?</h3>
          <p className="text-gray-300">Click the <Link to="/signup" className="text-purple-400 underline hover:text-purple-300">Sign Up</Link> button above and fill out the registration form to create your account.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Can I manage multiple events?</h3>
          <p className="text-gray-300">Yes! Our platform allows you to manage bookings and details for multiple events simultaneously.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Is there support available?</h3>
          <p className="text-gray-300">Absolutely! Our support team is available to assist you with any questions or issues you may have.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Is it free to use?</h3>
          <p className="text-gray-300">Yes — Bookington is free right now. We plan to offer optional advanced features at a cost later; core booking flow will remain usable for free.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">What regions are supported?</h3>
          <p className="text-gray-300">Currently the platform supports the United States only. We’ll expand internationally based on demand.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">Can I use it on mobile?</h3>
          <p className="text-gray-300">Yes — the app is mobile-friendly. For the best experience (faster search and editing), we recommend using desktop.</p>
        </div>
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">How do DJs update availability?</h3>
          <p className="text-gray-300">Go to <strong>Edit Profile</strong> → <strong>Availability</strong>. First select the weekdays you’re usually available. Then use <strong>Custom Dates</strong> to mark specific days as unavailable (or available when you’re usually unavailable).</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
