import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import pdf from 'vue-pdf-next';

const app = createApp(App)
app.use(pdf);
app.mount('#app')
