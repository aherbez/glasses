# glasses
This was a quick prototype of a web-based tool for customizing a virtual item (a pair of glasses)

See it live [here](http://www.adrianherbez.net/glasses/01/).

It renders a pair of (sun)glasses, and allows the user to change the shape of the eyes, bridge, and... the part that rests on the ear (not sure what the correct term is).

This was put together in a weekend using the [example code](https://github.com/aherbez/webcad) that I put together for [my talk on creating web-based CAD tools](https://www.youtube.com/watch?v=SMQuoI_M-kk) at the Rogelike Celebration 2020.

There are a couple of things that would need to change about this to take it further, namely
- using bufferedgeometry instead of Geometry
- exporting to a different file format (GLTF instead of STL)

Both of those having been inherited from the boilerplate code I wrote to be easy to understand and geared towards 3d printing, and would be easy enough to change.

