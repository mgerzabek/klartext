# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "klartext"
  spec.version       = "0.1.0"
  spec.authors       = ["Michael Gerzabek"]
  spec.email         = ["michael.gerzabek@gmail.com"]

  spec.summary       = "Ein Jekyll Theme für EPUs, Brainworker (Berater, Trainer und Coaches), Content Marketer, Autoren, Wissenschafter und Schreibwütige."
  spec.homepage      = "https://github.com/storyfaktor/klartext"
  spec.license       = "MIT"

  spec.metadata["plugin_type"] = "theme"

  spec.files = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(_data|_includes|_layouts|_sass|assets|_config\.yml|LICENSE|README)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.2"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.9"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.1"

  spec.add_development_dependency "bundler"
end
