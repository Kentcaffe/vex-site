/** Tema fixă light — rulează înainte de paint (fără flash dark / fără conflict cu preferințe sistem). */
export function ThemeScript() {
  const code = `(function(){try{var r=document.documentElement;r.classList.remove('dark');r.style.colorScheme='light';localStorage.setItem('vex-theme','light');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
