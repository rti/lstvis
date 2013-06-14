Lstvis - LST File Visualization
===============================

Visualize objdump's .lst / .lss files to understand size of compiled code.

Howto use
---------

GCC your code with debug symbols to include source code infomation in the analysis.

    gcc -g ...

Process you ELF file with objdump to get a .lst file.

    objdump -h -S my.elf > my.lst

Open index.html in your browser, paste the .lst's contents and click 'Analayze'.

**Have fun!**
