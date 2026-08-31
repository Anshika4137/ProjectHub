import { Link } from 'react-router-dom';
import projectHubLogo from '../assets/projecthub-logo-mark.png';
import '../styles/brand.css';

export function ProjectHubMark({ className = '' }) {
  return (
    <span className={`projecthub-mark ${className}`} aria-hidden="true">
      <img src={projectHubLogo} alt="" />
    </span>
  );
}

export default function ProjectHubBrand({ className = '', hero = false }) {
  return (
    <Link to="/" className={`projecthub-brand ${hero ? 'projecthub-brand--hero' : ''} ${className}`} aria-label="ProjectHub home">
      <ProjectHubMark />
      <span className="projecthub-brand-name">ProjectHub</span>
    </Link>
  );
}
