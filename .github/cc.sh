cd klartext
MESSAGE="$(git log -1 --pretty=%B)"
cd ../extended
if [ -z "$(git status --porcelain)" ]; then exit 0 fi
git config user.name github-actions
git config user.email github-actions@github.com
git add .
git commit -m "klartext: $MESSAGE"
git push