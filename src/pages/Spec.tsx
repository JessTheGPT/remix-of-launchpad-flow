import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Pipeline from '@/components/Pipeline';
import SharedState from '@/components/SharedState';
import HITLCheckpoints from '@/components/HITLCheckpoints';
import ErrorHandling from '@/components/ErrorHandling';
import ExecutionFlow from '@/components/ExecutionFlow';
import RepoMap from '@/components/RepoMap';
import LangGraphMapping from '@/components/LangGraphMapping';
import Footer from '@/components/Footer';

const Spec = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />
        <Pipeline />
        <SharedState />
        <HITLCheckpoints />
        <ErrorHandling />
        <ExecutionFlow />
        <RepoMap />
        <LangGraphMapping />
      </main>
      <Footer />
    </div>
  );
};

export default Spec;
