#!/bin/bash
#
ls -la
#
cp -u ./klartext/_includes/button/cta.html ./extended/_includes/button/cta.html
cp -u ./klartext/_includes/button/cta.w.alt.text.html ./extended/_includes/button/cta.w.alt.text.html
cp -u ./klartext/_includes/icons/external-link.html ./extended/_includes/icons/external-link.html
cp -u ./klartext/_includes/icons/link.html ./extended/_includes/icons/link.html
cp -u ./klartext/_includes/testimonial/basic.html ./extended/_includes/testimonial/basic.html
cp -u ./klartext/_includes/audio.html ./extended/_includes/audio.html
cp -u ./klartext/_includes/credit.html ./extended/_includes/credit.html
cp -u ./klartext/_includes/custom-head.html ./extended/_includes/custom-head.html
cp -u ./klartext/_includes/custom-pre-closing-body.html ./extended/_includes/custom-pre-closing-body.html
cp -u ./klartext/_includes/datum.html ./extended/_includes/datum.html
cp -u ./klartext/_includes/figure.html ./extended/_includes/figure.html
cp -u ./klartext/_includes/footer.html ./extended/_includes/footer.html
cp -u ./klartext/_includes/header.html ./extended/_includes/header.html
cp -u ./klartext/_includes/navigation.html ./extended/_includes/navigation.html
cp -u ./klartext/_includes/sidebar.html ./extended/_includes/sidebar.html
cp -u ./klartext/_includes/skin.html ./extended/_includes/skin.html
cp -u ./klartext/_includes/social.html ./extended/_includes/social.html
cp -u ./klartext/_includes/youtube.html ./extended/_includes/youtube.html
cp -u ./klartext/_layouts/landing.html ./extended/_layouts/landing.html
cp -u ./klartext/_layouts/page.html ./extended/_layouts/page.html
cp -u ./klartext/_layouts/post.html ./extended/_layouts/post.html
cp -u ./klartext/_layouts/video.html ./extended/_layouts/video.html
cp  ./_site/assets/style.css ./extended/assets/klartext.css
cp  ./_site/assets/style.css.map ./extended/assets/klartext.css.map
cd klartext
MESSAGE="$(git log -1 --pretty=%B)"
cd ../extended
git config user.name github-actions
git config user.email github-actions@github.com
git add .
if [ -n "$(git status --porcelain)" ]; 
then
  git commit -m "klartext: $MESSAGE"
  git push
fi
