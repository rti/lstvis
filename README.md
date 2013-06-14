Lstvis - LST File Visualization
===============================

Visualize objdump's .lst / .lss files to understand the size of compiled code. 
Lstvis analyzes sections and symbols referenced in objdump's output and compiles 
those information into a ordered list of graphs including source code, 
assambly code and raw binary data.

Howto use
---------

GCC your code with **debug symbols** to include source code infomation in the analysis.

    gcc -g ...

Process you ELF file with **objdump** to get a .lst file.

    objdump -h -S my.elf > my.lst

Open **index.html** in your browser, paste the **.lst's contents** into the textbox and **click 'Analyze'**.

**Have fun!**
