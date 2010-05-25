require 'rubygems'
require 'closure-compiler'

desc "Use the Closure Compiler to compress emile.js"
task :default do
  js  = File.open('emile.js', 'r')
  min = Closure::Compiler.new.compile(js)
  File.open('emile.min.js', 'w') {|f| f.write(min) }
end

