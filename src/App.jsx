import React from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import HowItWorks from './components/HowItWorks';
import Preview from './components/Preview';
import Benefits from './components/Benefits';
import Waitlist from './components/Waitlist';

function App() {
  return (
    <Layout>
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Preview />
      <Benefits />
      <Waitlist />
    </Layout>
  );
}

export default App;
