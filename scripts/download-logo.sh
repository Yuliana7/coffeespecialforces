#!/usr/bin/env bash
set -e
mkdir -p public/assets
curl -L "https://scontent-waw2-2.cdninstagram.com/v/t51.82787-19/583791582_17863609551526912_52275953107399123_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=105&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=UMIDVfN5V_4Q7kNvwHD6YbZ&_nc_oc=AdoKQMRd7_kwS7feSZYD73GF1R48dbZY7VbKpDjVjeVb1MWPJ6--B1uaioUbGxThe3rUcFoaHFf0vI3M5d_3g1Ua&_nc_zt=24&_nc_ht=scontent-waw2-2.cdninstagram.com&_nc_gid=owQlkuw4pTgdXYOU1l3Y9w&_nc_ss=7b289&oh=00_AQKWLq4YZtMb_OzIyew8-3a2tgmjkaip7q0u_v89N6zLig&oe=6AA4ED9C" -o public/assets/logo.jpg
echo "Downloaded logo to public/assets/logo.jpg"
