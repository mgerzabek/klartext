cd klartext
MESSAGE="$(git log -1 --pretty=%B)"
cd ../extended
if [ "$(git status --porcelain)" ]; 
then
  git config user.name github-actions
  git config user.email github-actions@github.com
  git add .
  git commit -m "klartext: $MESSAGE"
  git push
fi
