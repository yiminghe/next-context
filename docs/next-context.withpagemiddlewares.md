<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [next-context](./next-context.md) &gt; [withPageMiddlewares](./next-context.withpagemiddlewares.md)

## withPageMiddlewares() function

create higher order page component with middlewares

**Signature:**

```typescript
export declare function withPageMiddlewares(fns: MiddlewareFunction[]): (Page: PageFunction) => PageFunction;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

fns


</td><td>

[MiddlewareFunction](./next-context.middlewarefunction.md)<!-- -->\[\]


</td><td>


</td></tr>
</tbody></table>
**Returns:**

(Page: [PageFunction](./next-context.pagefunction.md)<!-- -->) =&gt; [PageFunction](./next-context.pagefunction.md)

