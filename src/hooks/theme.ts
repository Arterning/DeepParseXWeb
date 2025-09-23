import { useAppStore } from '@/store';


export const changeTheme = () => {
  const themeStore = useAppStore();
  if (themeStore.theme === 'light') {
      const cards = document.querySelectorAll('.general-card');
      cards.forEach((card: any) => {
        // card.style.background = 'linear-gradient(146.3deg, #F0F1F7 11.56%, #D5D7E0 80%)';
        card.style.background = '#FFF';
      });
  } else {
      const cards = document.querySelectorAll('.general-card');
      cards.forEach((card: any) => {
        card.style.background = '';
      });
  }
}

export const changeThemeColor = (color: string) => {
  const themeStore = useAppStore();
}