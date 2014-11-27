
The version of Infusion included in this folder was created using a custom build from commit `f5d4f6ac978fe235baf0986b56edd7af6c0bd452`

of the Infusion master branch

<https://github.com/fluid-project/infusion>

using the command line

grunt custom --source=true --include="renderer, normalize"

The following directories were stripped out of the build since they contain code that is included in the infusion-custom.js file:

* README.md
* ReleaseNotes.md
* src/shared/lib/infusion/src/framework/core/frameworkDependencies.json
* src/shared/lib/infusion/src/framework/core/js/
* src/shared/lib/infusion/src/framework/renderer/
* src/shared/lib/infusion/src/lib/fastXmlPull/
* src/shared/lib/infusion/src/lib/jquery/core/
* src/shared/lib/infusion/src/lib/jquery/ui/jQueryUICoreDependencies.json
* src/shared/lib/infusion/src/lib/jquery/ui/jQueryUIWidgetsDependencies.json
* src/shared/lib/infusion/src/lib/jquery/ui/js/
* src/shared/lib/infusion/src/lib/normalize/normalizeDependencies.json

Additionally, the testing framework from Infusion is used (public/tests/lib/infusion) and should be updated to a matching version. This directory is a copy of

https://github.com/fluid-project/infusion/tree/master/tests

The following directories were stripped out since they contain code that is not required:

* all-tests.html
* component-tests/
* framework-tests/
* manual-tests/
* node-tests/
* test-core/testTests/
