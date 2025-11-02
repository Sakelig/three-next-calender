-[x] now remembers users and can preopen doors
-[x] clicked doors should be saved to db (need new endpoint to save to numbers array in db) 
-[x] Each door can now have their own image
-[x] IMPORTANT! Cut doors to match calender spot and add calender number
-[x] host on aws
-[x] should use my domain adventcalender.sakelig
-[x] APIGATE way with simple go lambda
-[x] frontend should call backend which should call the apigateway endpoint
-[ ] s3 bucket with content
-[ ] lambda gets content from s3 based on request
-[x] handle new door and content each day
-[ ] security group for amplify and lambda/api gateway
-[x] Need to draw boxes
-[x] Handles images
-[x] Handles videos
-[x] node cutDoors.js to make the doors


## image data
- image scale size 1311 × 1668 pixels (can use pixler but need premium??) 
- door size 208 x 256 pixels (door data seems slihtly wrong??)
- door positions:
  Row 1:
  Door 1: x=109, y=90
  Door 2: x=317, y=90
  Door 3: x=524, y=90
  Door 4: x=732, y=90
  Door 5: x=940, y=90
  Door 6: x=1147, y=90

  Row 2:
  Door 7: x=109, y=419
  Door 8: x=317, y=419
  Door 9: x=524, y=419
  Door 10: x=732, y=419
  Door 11: x=940, y=419
  Door 12: x=1147, y=419

  Row 3:
  Door 13: x=109, y=748
  Door 14: x=317, y=748
  Door 15: x=524, y=748
  Door 16: x=732, y=748
  Door 17: x=940, y=748
  Door 18: x=1147, y=748

  Row 4:
  Door 19: x=109, y=1077
  Door 20: x=317, y=1077
  Door 21: x=524, y=1077
  Door 22: x=732, y=1077
  Door 23: x=940, y=1077
  Door 24: x=1147, y=1077

### not needed but could
-[ ] discord login (check discrod notes for other stuff)
-[ ] Need timer to show when next box opens
----------------------------

[![Downloads](https://img.shields.io/npm/dt/create-r3f-app.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/create-r3f-app) [![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

# :japanese_castle: React-Three-Next starter

A minimalist starter for NextJS, @react-three/fiber and Threejs.

![](https://user-images.githubusercontent.com/2223602/192515435-a3d2c1bb-b79a-428e-92e5-f44c97a54bf7.jpg)

- TTL ~ 100ms
- First load JS ~ 79kb
- Lighthouse score of 100 (Performance, Accessibility, Best Practices, SEO)

This starter allows you to navigate seamlessly between pages with dynamic dom and/or canvas content without reloading or creating a new canvas every time. 3D components are usable anywhere in the dom. The events, dom, viewport, everything is synchronized!

### ⚫ Demo :

[![image](https://user-images.githubusercontent.com/15867665/231395343-fd4770e3-0e39-4f5c-ac30-71d823a9ef1c.png)](https://react-three-next.vercel.app/)

### How to use

#### Installation

_Tailwind is the default style. styled-components (styled) are also available._

```sh
yarn create r3f-app next my-app
# yarn create r3f-app <next> my-app <tailwind|styled>? -ts?
# npx create-r3f-app next my-app
```

### :passport_control: Typescript

For typescript add the parameter `-ts` or `--typescript`:

```sh
yarn create r3f-app next my-app -ts
# npx create-r3f-app next my-app -ts
```

### :mount_fuji: Features

- [x] GLSL imports
- [x] Canvas is not getting unmounted while navigating between pages
- [x] Canvas components usable in any div of the page
- [x] Based on the App directory architecture
- [x] PWA Support

### :bullettrain_side: Architecture

Thanks to [tunnel-rat](https://github.com/pmndrs/tunnel-rat) the starter can portal components between separate renderers. Anything rendered inside the `<View/>` component of the starter will be rendered in the 3D Context. For better performances it uses gl.scissor to cut the viewport into segments.

```jsx
<div className='relative'>
  <View orbit className='relative sm:h-48 sm:w-full'>
    <Dog scale={2} />
    // Some 3D components will be rendered here
  </View>
</div>
```

### :control_knobs: Available Scripts

- `yarn dev` - Next dev
- `yarn analyze` - Generate bundle-analyzer
- `yarn lint` - Audit code quality
- `yarn build` - Next build
- `yarn start` - Next start

### ⬛ Stack

- [`create-r3f-app`](https://github.com/utsuboco/create-r3f-app) &ndash; Command line tool to simplify the installation.
- [`threejs`](https://github.com/mrdoob/three.js/) &ndash; A lightweight, 3D library with a default WebGL renderer.
- [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) &ndash; A React renderer for Threejs on the web and react-native.
- [`@react-three/drei` - Optional](https://github.com/pmndrs/drei) &ndash; useful helpers for react-three-fiber
- [`@react-three/a11y` - Optional](https://github.com/pmndrs/react-three-a11y/) &ndash; Accessibility tools for React Three Fiber
- [`r3f-perf` - Optional](https://github.com/RenaudRohlinger/r3f-perf) &ndash; Tool to easily monitor react threejs performances.

### How to contribute :

```bash
git clone https://github.com/pmndrs/react-three-next
&& cd react-three-next && yarn install
```

### Maintainers :

- [`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
