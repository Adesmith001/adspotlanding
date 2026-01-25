// @ts-ignore - JSX component
import Header from '../components/Header';
// @ts-ignore - JSX component
import Hero from '../components/Hero';
// @ts-ignore - JSX component
import Problem from '../components/Problem';
// @ts-ignore - JSX component
import Solution from '../components/Solution';
// @ts-ignore - JSX component
import HowItWorks from '../components/HowItWorks';
// @ts-ignore - JSX component
import Benefits from '../components/Benefits';
// @ts-ignore - JSX component
import Preview from '../components/Preview';
// @ts-ignore - JSX component
import Waitlist from '../components/Waitlist';
// @ts-ignore - JSX component
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Header />
            <Hero />
            <Problem />
            <Solution />
            <HowItWorks />
            <Benefits />
            <Preview />
            <Waitlist />
            <Footer />
        </div>
    );
};

export default Home;
