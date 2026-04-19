export const header = () => ({
  homeLink: {
    ["@click.prevent"]() {
      const a = Object.assign(document.createElement('a'), { href: '/' });
      document.body.append(a);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      a.remove();
    }
  }
})