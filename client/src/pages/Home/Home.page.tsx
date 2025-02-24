import { ColorSchemeToggle } from '../../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../../components/Welcome/Welcome';

export default function HomePage() {
  return (
    <div className='HomePage'>
      <Welcome />
      <ColorSchemeToggle />
    </div>
  );
}
