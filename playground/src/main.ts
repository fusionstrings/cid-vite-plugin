import './style.css';
import javascriptLogo from './javascript.svg';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${javascriptLogo}" class="logo" alt="Vite logo" />
    </a>
    <h1>Hello CID!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

const btn = document.querySelector<HTMLButtonElement>('#counter')!;
let count = 0;
btn.addEventListener('click', () => {
    count++;
    btn.innerHTML = `count is ${count}`;
});
