describe("Component Inject", function () {
    beforeEach(function () {
        spyOn(console, 'warn');
    });

    it("Injection is array", function (done) {
        let injectSuccess = '';
        var child3 = san.defineComponent({
            inject: ['$app'],
            attached() {
                injectSuccess = this.$app.text;
            },
            template: '<div>child3</div>'
        });
        var child2 = san.defineComponent({
            components: {
                child3,
            },
            template: '<div><child3 /></div>'
        });
        var child1 = san.defineComponent({
            components: {
                child2,
            },
            template: '<div><child2 /></div>'
        });
        var MyComponent = san.defineComponent({
            provide: {
                $app: {
                    text: '$app'
                }
            },
            components: {
                child1,
            },
            template: '<div><child1 /></div>'
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        setTimeout(function () {
            expect(injectSuccess).toBe('$app');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 500);
    });

    it("Injection is object", function (done) {
        var provideApp = {
            text: '$app',
            name: 'alice'
        };
        var defaultApp = {};
        var injectDefaultApp = null;
        var injectApp = null;
        var injectText = '';
        var injectName = '';
        var injectAge = 80;
        var child3 = san.defineComponent({
            inject: {
                $app: '$app',
                defaultApp: {
                    from: '$defaultApp',
                    // default 函数的触发只在第一层没找到的时候生效
                    default() {
                        return defaultApp;
                    }
                },
                text: '$app.text',
                name: {
                    from: '$app.name',
                    default() {
                        return 'bob';
                    }
                },
                age: {
                    from: '$app.age',
                    default() {
                        return 18;
                    }
                }
            },
            compiled() {
                injectText = this.text;
            },
            inited() {
                injectName = this.name;
            },
            attached() {
                injectAge = this.age;
                injectApp = this.$app;
                injectDefaultApp = this.defaultApp;
            },
            template: '<div>child3</div>'
        });
        var child2 = san.defineComponent({
            components: {
                child3,
            },
            template: '<div><child3 /></div>'
        });
        var child1 = san.defineComponent({
            components: {
                child2,
            },
            template: '<div><child2 /></div>'
        });
        var MyComponent = san.defineComponent({
            provide: {
                $app: provideApp
            },
            components: {
                child1,
            },
            template: '<div><child1 /></div>'
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        setTimeout(function () {
            expect(injectText).toBe('$app');
            expect(injectName).toBe('alice');
            expect(injectAge).toBe(undefined);
            expect(injectApp).toBe(provideApp);
            expect(injectDefaultApp).toBe(defaultApp);

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 500);
    });

    typeof console !== 'undefined' &&  san.debug && it("Inject is invalid", function (done) {
        let injectSuccess = '';
        var child3 = san.defineComponent({
            inject: 1,
            attached() {
                injectSuccess = this.text;
            },
            template: '<div>child3</div>'
        });
        var child2 = san.defineComponent({
            components: {
                child3,
            },
            template: '<div><child3 /></div>'
        });
        var child1 = san.defineComponent({
            components: {
                child2,
            },
            template: '<div><child2 /></div>'
        });
        var MyComponent = san.defineComponent({
            provide: {
                $app: {
                    text: '$app'
                }
            },
            components: {
                child1,
            },
            template: '<div><child1 /></div>'
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        setTimeout(function () {
            expect(injectSuccess).toBe(undefined);

            expect(console.warn).toHaveBeenCalled();
            var msg = console.warn.calls.first().args[0];
            expect(msg).toContain('Invalid value');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 500);
    });

    typeof console !== 'undefined' &&  san.debug && it("Inject a existed property", function (done) {
        let injectSuccess = '';
        var child3 = san.defineComponent({
            existed: 'already exists',
            inject: {
                existed: {
                    from: '$app.text'
                }
            },
            attached() {
                injectSuccess = this.existed;
            },
            template: '<div>child3</div>'
        });
        var child2 = san.defineComponent({
            components: {
                child3,
            },
            template: '<div><child3 /></div>'
        });
        var child1 = san.defineComponent({
            components: {
                child2,
            },
            template: '<div><child2 /></div>'
        });
        var MyComponent = san.defineComponent({
            provide: {
                $app: {
                    text: '$app'
                }
            },
            components: {
                child1,
            },
            template: '<div><child1 /></div>'
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        setTimeout(function () {
            expect(injectSuccess).toBe('$app');

            expect(console.warn).toHaveBeenCalled();
            var msg = console.warn.calls.first().args[0];
            expect(msg).toContain('already existed');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 500);
    });

    it("Injection with slot", function (done) {
        let injectSuccess = '';
        var child3 = san.defineComponent({
            inject: ['$app'],
            attached() {
                injectSuccess = this.$app.text;
            },
            template: '<div>child3</div>'
        });
        var child2 = san.defineComponent({
            components: {
                child3,
            },
            template: '<div><child3 /></div>'
        });
        var child1 = san.defineComponent({
            template: '<div><slot /></div>'
        });
        var MyComponent = san.defineComponent({
            provide: {
                $app: {
                    text: '$app'
                }
            },
            components: {
                child1,
                child2,
            },
            template: ''
                + '<div>'
                    + '<child1>'
                        + '<child2 />'
                    + '</child1>'
                + '</div> '
        });

        var myComponent = new MyComponent();
        var wrap = document.createElement('div');
        document.body.appendChild(wrap);
        myComponent.attach(wrap);

        setTimeout(function () {
            expect(injectSuccess).toBe('$app');

            myComponent.dispose();
            document.body.removeChild(wrap);
            done();
        }, 500);
    });
});
