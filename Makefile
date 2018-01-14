BLDDIR = build

# Necessary because zip copies leading directories if run from above targets
ABS_BLDDIR := $(shell readlink -f $(BLDDIR))

all: xpi

xpi: $(BLDDIR)/lyz.xpi

$(BLDDIR)/lyz.xpi:
	@mkdir -p $(dir $@)
	cd addon; zip -FSr $(ABS_BLDDIR)/lyz.xpi * -x \*.swp -x '#*#' -x \*~

clean:
	rm -f $(BLDDIR)/lyz.xpi

.PHONY: all clean xpi
