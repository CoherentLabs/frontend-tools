import { mount } from 'svelte';
import 'virtual:uno.css';
import './styles/global.scss';
import App from './App.svelte';

const target = document.getElementById('app');

if (!target) {
  throw new Error('Root element not found');
}

mount(App, { target });
