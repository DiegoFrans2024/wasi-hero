import { View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

/** En web, Skia necesita cargar CanvasKit (WebAssembly) antes de dibujar. La ruta es relativa para que funcione también en GitHub Pages. */
export default function App() {
  return (
    <WithSkiaWeb
      opts={{ locateFile: (file) => file }}
      getComponent={() => import('./src/story/HeroStory')}
      fallback={<View style={{ flex: 1, backgroundColor: '#0A1530' }} />}
    />
  );
}
